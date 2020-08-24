import { exec, ExecOptions } from '@actions/exec'
import * as core from '@actions/core'

export async function getChangesIntroducedByTag(tag: string): Promise<string> {
    const previousVersionTag = await getPreviousVersionTag(tag)
    
    return previousVersionTag ? getCommitMessagesBetween(previousVersionTag, tag) : getCommitMessagesFrom(tag)
}

export async function getPreviousVersionTag(tag: string): Promise<string | null> {
    let previousTag = ''
    // API to capture a program's output
    const options: ExecOptions = {
        // this field contains a function (stdout) whose goal is to capture the standard output stream
        // stderr will capture the standard error stream
        listeners: {
            stdout:  (data: Buffer) => {
                previousTag += data.toString()
            }
        },
        // by default, the exec function is going to print the entire command to the build log, which we don't
        // want since it's better to provide our own logging. So, to suppress the build output...
        silent: true,
        // tells the exec function not to show an error if the program exits with something other than a 0
        ignoreReturnCode: true
    }
    // first arg: name of program to run
    // second arg: array of strings that represent the params we want to pass to the command line program
    // 'describe'          -- tells git to look for tags
    // '--match', 'v[0=9]* -- tells git to only look for version tags
    // '--abbrev=0'        -- will only print the tag name
    // '--first-parent'    -- will only search the current branch in case of a merge commit
    // '${tag}^'           -- tells git to start looking from the parent of the specified tag
    // third arg: exec options defined above
    const exitCode = await exec(
        'git', 
        ['describe',
        '--match', 'v[0=9]*',
        '--abbrev=0',
        '--first-parent',
        '${tag}^'],
        options)

    //to log result of the command
    core.debug(`The previous version tag is ${previousTag}`)

    return exitCode === 0 ? previousTag.trim() : null
}

export async function getCommitMessagesBetween(firstTag: string, secondTag: string): Promise<string> {
    let commitMessages = ''
    const options: ExecOptions = {
        // this field contains a function (stdout) whose goal is to capture the standard output stream
        // stderr will capture the standard error stream
        listeners: {
            stdout:  (data: Buffer) => {
                commitMessages += data.toString()
            }
        },
        // by default, the exec function is going to print the entire command to the build log, which we don't
        // want since it's better to provide our own logging. So, to suppress the build output...
        silent: true
    }

    // '--format=%s' -- tells git to only print the first line of the commit message
    // `${firstTag}..${secondTag}` -- this notation tells git to only include the commits that are reachable
    //                                from the secondTag, but not the firstTag. In other words, the commits that
    //                                happen between them
    await exec(
        'git',
        ['log',
        '--format=%s',
        `${firstTag}..${secondTag}`],
        options);

    
    core.debug(`The commit messages between ${firstTag} and ${secondTag} are:\n${commitMessages}`)

    // we don't check the exit code here because 'git log' doesn't fail under normal circumstances 
    return commitMessages.trim()
}

export async function getCommitMessagesFrom(tag: string): Promise<string> {
    let commitMessages = ''
    const options: ExecOptions = {
        // this field contains a function (stdout) whose goal is to capture the standard output stream
        // stderr will capture the standard error stream
        listeners: {
            stdout:  (data: Buffer) => {
                commitMessages += data.toString()
            }
        },
        // by default, the exec function is going to print the entire command to the build log, which we don't
        // want since it's better to provide our own logging. So, to suppress the build output...
        silent: true
    } 

    // '--format=%s' -- tells git to only print the first line of the commit message
    await exec(
        'git',
        ['log',
        '--format=%s',
        '${tag}'],
        options); 
    
    core.debug(`The commit messages from ${tag} are:\n${commitMessages}`)

    return commitMessages.trim()
}