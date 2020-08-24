import * as github from '@actions/github'
import * as version from './version'
import * as markdown from './markdown'
import * as core from '@actions/core'

export async function createReleaseDraft(
    versionTag: string,
    repoToken: string,
    changeLog: string
): Promise<string> {
// creating an object of type Github
const octokit = github.getOctokit(repoToken)

// function to create the release
// owner & repo -- tell in which repo the release should be created
// tag_name     -- the name of the tag to associate with the release
// name         -- name of the release itself
// body         -- changes that happened since the last release
//                 GitHub release allows you to use markdown to format the context
// prelease     -- indicates if the versionTag contains a prerelease tag
// draft        -- whether or not to mark the release as a draft
const response = await octokit.repos.createRelease({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    tag_name: versionTag,
    name: version.removePrefix(versionTag),
    body: markdown.toUnorderedList(changeLog),
    prerelease: version.isPrerelease(versionTag),
    draft: true
})

if (response.status !== 201) {
    throw new Error(`Failed to create the release: ${response.status}`)
}
core.info(`Created release draft ${response.data.name}`)

// returns url of release page
return response.data.html_url
}