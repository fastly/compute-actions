# RELEASE

- Merge all PRs intended for inclusion in the new release.
- Create a new branch for the release.
- Run `npm run bundle-all` to bundle the actions into JavaScript files.
- Commit the changes.
- Open a pull request for the release branch, requesting approval from relevant teams.
- Run `git tag -s "<TAG>" -m "<TAG>" && git push origin "<TAG>"`.
- Merge the pull request.
- Create a new release via the GitHub UI.
