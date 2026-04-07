# Versioning and Rollback

This project now supports automatic GitHub version snapshots.

## How it works

- Every push to main that changes build-version.json triggers a workflow.
- The workflow creates a tag named v<version>.
- It also creates a GitHub Release for that tag.

Workflow file:
- .github/workflows/tag-on-version-bump.yml

## Recommended release flow

1. Update build-version.json with a new version.
2. Commit and push to main.
3. Wait for the workflow to complete.
4. Verify the new tag and release on GitHub.

## Roll back to an older version

Use the GitHub workflow to create a rollback pull request from a tag.

Workflow file:
- .github/workflows/rollback-to-tag.yml

From GitHub UI:

1. Open Actions.
2. Choose Rollback To Tag.
3. Click Run workflow.
4. Enter tag, for example v2026.04.04.4.
5. Keep target branch as main.
6. Run workflow.

The workflow will:

- validate the tag exists,
- create a branch from that tag,
- open a pull request to main.

Merge that pull request to complete rollback safely.

## Notes

- Keep versions monotonic in build-version.json.
- Avoid reusing old version numbers.
- Tags and releases become your safety points for future performance regressions.
