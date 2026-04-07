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

Use an existing tag and redeploy that commit to main:

```powershell
git fetch --tags
git checkout v2026.04.04.4
git checkout -b rollback/v2026.04.04.4
git push origin rollback/v2026.04.04.4
```

Then either:
- open a pull request from rollback branch to main, or
- reset main to that tag locally and push (only if you intentionally want hard rollback).

## Notes

- Keep versions monotonic in build-version.json.
- Avoid reusing old version numbers.
- Tags and releases become your safety points for future performance regressions.
