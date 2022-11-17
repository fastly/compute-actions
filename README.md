# GitHub Actions for Compute@Edge

This repository contains GitHub Actions to help you build on Fastly's Compute@Edge platform, such as installing the CLI, and building and deploying services.

> **IMPORTANT:** Compute@Edge is currently in limited availability. For more information on what this means, read the [Fastly product and feature lifecycle](https://docs.fastly.com/products/fastly-product-lifecycle#limited-availability) guide.

## Usage

To compile and deploy a Compute@Edge service at the root of the repository, you can use the `fastly/compute-actions` main action. This will install the Fastly CLI, build your project, and deploy it to your Fastly service. If you used `fastly compute init` to initialise your project, this will work out of the box:

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
    - uses: actions/checkout@v3

    - name: Install Rust toolchain
      uses: actions-rs/toolchain@v1
      with:
          toolchain: 1.54.0 # current Rust toolchain for Compute@Edge
          target: wasm32-wasi # WebAssembly target

    - name: Deploy to Compute@Edge
      uses: fastly/compute-actions@v4
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
    - uses: actions/checkout@v3

    - name: Install project dependencies
      run: npm install

    - name: Deploy to Compute@Edge
      uses: fastly/compute-actions@v4
      env:
        FASTLY_API_TOKEN: ${{ secrets.FASTLY_API_TOKEN }}
```

### Custom Workflows

Alternatively, you can manually run the individual GitHub Actions for Compute@Edge if you want finer control over your workflow:

- [fastly/compute-actions/setup](setup/index.js) - Download the Fastly CLI if not already installed
- [fastly/compute-actions/build](build/index.js) - Build a Compute@Edge project. Equivalent to `fastly compute build`
- [fastly/compute-actions/deploy](deploy/index.js) - Deploy a Compute@Edge project. Equivalent to `fastly compute deploy`

```yml
name: Deploy Application
on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up Fastly CLI
      uses: fastly/compute-actions/setup@v4
      with:
        cli_version: '4.3.0' # optional, defaults to 'latest'
        token: ${{ secrets.GITHUB_TOKEN }}

    - name: Install Dependencies
      run: npm install

    - name: Build Compute@Edge Package
      uses: fastly/compute-actions/build@v4
      with:
        verbose: true # optionally enables verbose output, defaults to false
        skip_verification: true # optional, defaults to false

    - name: Deploy Compute@Edge Package
      uses: fastly/compute-actions/deploy@v4
      with:
        service_id: '4tYGx...' # optional, defaults to value in fastly.toml
        comment: 'Deployed via GitHub Actions' # optional
      env:
        FASTLY_API_TOKEN: ${{ secrets.FASTLY_API_TOKEN }}
```

### Inputs

The following inputs can be used as `with` keys for the actions in this repository; none of them are required:

* `project_directory` - Directory of the project to deploy, relative to the repository root.
* `cli_version` - The version of the Fastly CLI to install, e.g. v0.20.0
* `service_id` - The Fastly service ID to deploy to. Defaults to the value in `fastly.toml`. (deploy only)
* `comment` - An optional comment to be included with the deployed service version. (deploy only)
* `version` - Version to clone from when deploying. Can be "latest", "active", or the number of a specific version. (deploy only)
* `verbose` - Set to true to enable verbose logging.
* `skip_verification` - Skip verification steps before build. (build only)
* `token` - The GitHub token to use when interacting with the GitHub API.

## Security issues

Please see our [SECURITY.md](SECURITY.md) for guidance on reporting security-related issues.

## License

The source and documentation for this project are released under the [MIT License](LICENSE).
