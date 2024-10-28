# GitHub Actions for Compute

This repository contains GitHub Actions to help you build on Fastly's Compute platform, such as installing the CLI, and building and deploying services.

## Usage

To compile and deploy a Compute service at the root of the repository, you can use the `fastly/compute-actions` main action. This will install the Fastly CLI, build your project, and deploy it to your Fastly service. If you used `fastly compute init` to initialise your project, this will work out of the box:

### Cargo-based Workflow (Rust)

You will need to install the correct Rust toolchain for the action to build your project. The [rust-toolchain](https://github.com/marketplace/actions/rust-toolchain) action can handle this for you with the following configuration:

```yml
name: Deploy Application
on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Install Rust toolchain
      uses: dtolnay/rust-toolchain@stable
      with:
          targets: wasm32-wasi # WebAssembly target

    - name: Deploy to Compute
      uses: fastly/compute-actions@v9
      env:
        FASTLY_API_TOKEN: ${{ secrets.FASTLY_API_TOKEN }}
```

### npm-based Workflow (JavaScript + AssemblyScript)

GitHub Action runners come with a node toolchain pre-installed, so you can just run `npm install` to fetch your project's dependencies.

```yml
name: Deploy Application
on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Install project dependencies
      run: npm install

    - name: Deploy to Compute
      uses: fastly/compute-actions@v9
      env:
        FASTLY_API_TOKEN: ${{ secrets.FASTLY_API_TOKEN }}
```

### Custom Workflows

Alternatively, you can manually run the individual GitHub Actions for Compute if you want finer control over your workflow:

- [fastly/compute-actions/setup](setup/index.js) - Download the Fastly CLI if not already installed
- [fastly/compute-actions/build](build/index.js) - Build a Compute project. Equivalent to `fastly compute build`
- [fastly/compute-actions/deploy](deploy/index.js) - Deploy a Compute project. Equivalent to `fastly compute deploy`
- [fastly/compute-actions/preview](preview/action.yml) - Deploy a Compute project to a new Fastly Service, which is deleted when the pull-request is merged or closed.

#### Deploy to Fastly when push to `main`

```yml
name: Deploy Application
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up Fastly CLI
      uses: fastly/compute-actions/setup@v9
      with:
        cli_version: '1.0.0' # optional, defaults to 'latest'
        token: ${{ secrets.GITHUB_TOKEN }}

    - name: Install Dependencies
      run: npm install

    - name: Build Compute Package
      uses: fastly/compute-actions/build@v9
      with:
        verbose: true # optionally enables verbose output, defaults to false

    - name: Deploy Compute Package
      uses: fastly/compute-actions/deploy@v9
      with:
        service_id: '4tYGx...' # optional, defaults to value in fastly.toml
        comment: 'Deployed via GitHub Actions' # optional
      env:
        FASTLY_API_TOKEN: ${{ secrets.FASTLY_API_TOKEN }}
```

#### Preview on Fastly for each pull-request

```yml
name: Fastly Compute Branch Previews
concurrency:
  group: ${{ github.head_ref || github.run_id }}-${{ github.workflow}}
on:
  pull_request:
    types: [opened, synchronize, reopened, closed]
jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - uses: actions/checkout@v4
      - uses: fastly/compute-actions/preview@v9
        with:
          fastly-api-token: ${{ secrets.FASTLY_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs

The following inputs can be used as `with` keys for the actions in this repository; none of them are required:

- `project_directory` - Directory of the project to deploy, relative to the repository root.
- `cli_version` - The version of the Fastly CLI to install, e.g. v0.20.0
- `service_id` - The Fastly service ID to deploy to. Defaults to the value in `fastly.toml`. (deploy only)
- `comment` - An optional comment to be included with the deployed service version. (deploy only)
- `version` - Version to clone from when deploying. Can be "latest", "active", or the number of a specific version. (deploy only)
- `verbose` - Set to true to enable verbose logging.
- `token` - The GitHub token to use when interacting with the GitHub API.

## Security issues

Please see our [SECURITY.md](SECURITY.md) for guidance on reporting security-related issues.

## License

The source and documentation for this project are released under the [MIT License](LICENSE).
