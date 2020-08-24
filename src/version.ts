import * as semver from 'semver'

export function isSemVer(version: string): boolean {
    return semver.valid(version) !== null;
}