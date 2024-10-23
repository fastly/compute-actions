# RELEASE

- Merge all PRs intended for inclusion in the new release.
- Create a new branch for the release.
- Run `npm run bundle-all` to bundle the actions into JavaScript files.
- Commit the changes.
- Open a pull request for the release branch, requesting approval from relevant teams.
- Merge the pull request.
- Update your local branch (`git checkout main && git pull`).
- Tag a new release (`tag=vX.Y.Z && git tag -s $tag -m $tag && git push $(git config branch.$(git symbolic-ref -q --short HEAD).remote) $tag`).
- Create a new release via the GitHub UI.
