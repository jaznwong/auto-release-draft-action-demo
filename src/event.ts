import * as github from '@actions/github'
import * as core from '@actions/core'

export function getCreatedTag(): string | null {
    // github.context.eventName - provides the event name that triggered the workflow
    if (github.context.eventName != 'create') {
        // to log why the tag wasn't retrieved
        core.info(`The event name was ${github.context.eventName}`)
        return null
    }

    //WebhookPayload type exposes properties for the fields that are always part of the payload, regardless of which event it is
    // ref_type contains the kind of reference that was created
    if (github.context.payload.ref_type != 'tag') {
        core.info('The created reference was a branch, not a tag')
        return null
    }

    return github.context.payload.ref
}