# Releasing

This document describes the release process for the quiltt-js monorepo packages. Our release workflow is fully automated using [Changesets](https://github.com/changesets/changesets) and GitHub Actions.

For general contributing guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md). For project overview, see the [main README](README.md).

## Overview

The release process is designed to be simple and automated:

1. **Contributors** create changesets to describe their changes
2. **Changesets Bot** creates/updates a "Version Packages" PR automatically
3. **Maintainers** review and merge the PR
4. **GitHub Actions** automatically publishes to npm and creates GitHub releases

## Published Packages

The following packages are published to npm:

- `@quiltt/core`
- `@quiltt/react`
- `@quiltt/react-native`

The example projects (`@quiltt/examples-nextjs`, `@quiltt/examples-react-native-expo`) are excluded from publishing but are versioned for tracking purposes.

## For Contributors: Creating a Changeset

### When to Create a Changeset

Create a changeset whenever you make changes that should be included in the next release:

- Bug fixes
- New features
- Breaking changes
- Documentation updates affecting the package API
- Dependency updates that affect consumers

### How to Create a Changeset

1. Make your code changes in a feature branch

2. Run the changeset command:

   ```bash
   pnpm changeset
   ```

3. Follow the interactive prompts:
   - **Select packages**: Choose which packages are affected by your changes
   - **Select bump type**: Choose the appropriate semantic version bump:
     - **patch**: Bug fixes and minor updates (1.0.0 → 1.0.1)
     - **minor**: New features, backwards-compatible (1.0.0 → 1.1.0)
     - **major**: Breaking changes (1.0.0 → 2.0.0)
   - **Write summary**: Describe your changes in a user-friendly way

4. Commit the generated changeset file (`.changeset/*.md`) with your changes:

   ```bash
   git add .changeset
   git commit -m "Add changeset for feature X"
   ```

5. Push your branch and create a pull request

### Changeset Best Practices

- **Be descriptive**: Write clear, user-facing descriptions of changes
- **One changeset per logical change**: Create separate changesets for unrelated changes
- **Use proper semantic versioning**: Choose the correct bump type
- **Reference issues/PRs**: Include issue numbers when applicable

### Example Changeset

```markdown
---
"@quiltt/react": minor
"@quiltt/core": patch
---

Add new useAccountBalance hook for real-time balance updates. Fixed JWT token refresh logic in auth client.
```

## For Maintainers: The Release Process

### Automated Workflow

Our release process is fully automated through the `.github/workflows/release.yml` GitHub Action:

#### 1. Version PR Creation

When changesets are merged to `main`, the Changesets GitHub Action automatically:

- Aggregates all pending changesets
- Calculates version bumps for affected packages
- Updates package.json versions
- Updates CHANGELOG.md files
- Creates or updates a PR titled "Version and Release Packages"

#### 2. Review and Merge

Maintainers should:

- Review the version PR to ensure:
  - Version bumps are appropriate
  - CHANGELOG entries are accurate and well-formatted
  - All expected changesets are included
- Merge the PR when ready to release

#### 3. Automatic Publishing

Upon merging the version PR, GitHub Actions automatically:

- Builds all packages
- Creates git tags for published packages
- Publishes packages to npm
- Creates GitHub releases with changelog entries

### Configuration Details

#### Fixed Versions

The following packages are configured with fixed versioning (they always release together with the same version):

```json
["@quiltt/core", "@quiltt/react", "@quiltt/react-native"]
```

This ensures consistency across the SDK.

#### Internal Dependencies

When a package updates its internal dependencies, it receives a `patch` bump automatically via the `updateInternalDependencies` setting.

#### Example Tags

Git tags for example projects (prefixed with `@quiltt/examples-`) are automatically cleaned up before each release to prevent tag clutter.

### Manual Release (Emergency Only)

In rare cases where manual intervention is needed:

```bash
# 1. Ensure you're on main and up-to-date
git checkout main
git pull origin main

# 2. Version packages (if not already done)
pnpm run version

# 3. Build packages
pnpm run build

# 4. Publish to npm
pnpm run publish
```

**Note**: Manual releases should be avoided as they bypass the automated changelog and GitHub release creation.

## Troubleshooting

### Changeset PR Not Created

If the Changesets bot doesn't create a PR:

- Ensure changesets exist in `.changeset/` directory
- Check that the GitHub Action has permissions to create PRs
- Verify the workflow ran successfully in the Actions tab

### Failed npm Publish

If publishing fails:

- Check that `NPM_TOKEN` secret is valid and not expired
- Verify package names are available on npm
- Ensure all packages build successfully locally
- Check npm registry status at [status.npmjs.org](https://status.npmjs.org/)

### Version Conflicts

If there are version conflicts:

- Ensure `main` branch is up-to-date before merging version PR
- Resolve conflicts in package.json and CHANGELOG.md files manually
- Re-run `pnpm install` to update lockfile

### Example Package Tags

Example packages are versioned but not published. If you see issues with example package tags:

- The workflow automatically cleans up `@quiltt/examples-*` tags
- These packages are in the `ignore` list in changeset config
- Their versions are tracked for reference but don't trigger npm publishes

## GitHub Actions Configuration

### Required Secrets

The following secrets must be configured in the GitHub repository:

- `NPM_TOKEN`: npm access token with publish permissions
  - **Important**: As of December 2025, npm requires granular access tokens that expire after 90 days and require 2FA by default. Classic tokens have been revoked. You'll need to rotate this token every 90 days to avoid CI/CD disruption.
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### Workflow Triggers

The release workflow triggers on:

- Push to `main` branch
- Uses concurrency control to prevent simultaneous releases

### Workflow Steps

1. **Checkout**: Clones the repository
2. **Setup**: Installs pnpm and Node.js with caching
3. **Dependencies**: Installs all dependencies
4. **Authentication**: Configures npm registry authentication
5. **Cleanup**: Removes example package tags
6. **Release**: Uses `changesets/action` to version and publish

## Related Documentation

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Main README](README.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## Support

If you encounter issues with the release process:

- Check the [GitHub Actions logs](https://github.com/quiltt/quiltt-js/actions)
- Review [Changesets documentation](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)
- Open an issue in the repository
