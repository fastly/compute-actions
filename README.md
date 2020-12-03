# GitHub Actions for Fastly

This repository contains GitHub Actions to help you build on the Fastly platform, such as installing the CLI, and building and deploying Compute@Edge services.

> **IMPORTANT:** GitHub Actions for Fastly is currently in beta. For more information on what this means, read the [Fastly product and feature lifecycle](https://docs.fastly.com/products/fastly-product-lifecycle#beta) guide.

## Usage

To compile and deploy a Compute@Edge service at the root of the repository. If you used `fastly compute init` to initialise your project, this will work out of the box:

### Rust-based Workflow

You will need to install the correct Rust toolchain for the Fastly action to build your project. The [rust-toolchain](https://github.com/marketplace/actions/rust-toolchain) action can handle this for you with the following configuration:

```yml
name: Deploy Application
on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Install Rust toolchain
      uses: actions-rs/toolchain@v1
      with:
          toolchain: 1.46.0 # current Rust toolchain for Compute@Edge
          target: wasm32-wasi # WebAssembly target

    - name: Deploy to Compute@Edge
      uses: fastly/actions@beta
      env:
        FASTLY_API_TOKEN: ${{ secrets.FASTLY_API_TOKEN }}
```

### AssemblyScript-based Workflow

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
    - uses: actions/checkout@v2

    - name: Install project dependencies
      runs: npm install

    - name: Deploy to Compute@Edge
      uses: fastly/actions@beta
      env:
        FASTLY_API_TOKEN: ${{ secrets.FASTLY_API_TOKEN }}
```

### Custom Workflows

Alternatively, you can manually run the individual Fastly compute actions if you want finer control over your workflow:

- [fastly/actions/setup](setup/index.js) - Download the Fastly CLI if not already installed
- [fastly/actions/build](build/index.js) - Build a Compute@Edge project. Equivalent to `fastly compute build`
- [fastly/actions/deploy](deploy/index.js) - Deploy a Compute@Edge project. Equivalent to `fastly compute deploy`

```yml
name: Deploy Application
on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1

    - name: Set up Fastly CLI
      uses: fastly/actions/setup@beta
      with:
        cli_version: '0.20.0' # optional, defaults to 'latest'

    - name: Install Dependencies
      run: npm install

    - name: Build Compute@Edge Package
      uses: fastly/actions/build@beta

    - name: Deploy Compute@Edge Package
      uses: fastly/actions/deploy@beta
      with:
        service_id: '4tYGx...' # optional, defaults to value in fastly.toml
      env:
        FASTLY_API_TOKEN: ${{ secrets.FASTLY_API_TOKEN }}
```

## Security issues

Please see our [SECURITY.md](SECURITY.md) for guidance on reporting security-related issues.

## License

The source and documentation for this project are released under the [MIT License](LICENSE).