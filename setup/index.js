const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { Octokit } = require('@octokit/rest');
const {createActionAuth} = require('@octokit/auth-action');
const semver = require('semver');
const { platform } = require('process');

const checkCLI = require('../util/cli');

async function setup() {
  try {
    await checkCLI();
  } catch (err) {
    await downloadCLI();
  }

  checkCLI().catch((err) => {
    core.setFailed(err.message);
  });
}

async function downloadCLI() {
  let cliVersion = core.getInput('cli_version');

  // Normalize version string
  if (cliVersion !== 'latest') {
    const valid = semver.valid(cliVersion);
    if (!valid) {
      core.setFailed(`The provided cli_version (${cliVersion}) is not a valid SemVer string.`);
      return;
    }

    cliVersion = `v${valid}`;
  }

  // Check to see if requested version is cached
  let existingVersion = tc.find('fastly', cliVersion);
  if (existingVersion) {
    core.addPath(existingVersion);
    return;
  }

  // Fetch requested release from fastly/cli repo
  const octo = new Octokit({authStrategy: createActionAuth});
  const repo = {
    owner: 'fastly',
    repo: 'cli',
    tag: cliVersion
  };

  let release;
  try {
    release = await (cliVersion === 'latest' ? octo.repos.getLatestRelease(repo) : octo.repos.getReleaseByTag(repo));
  } catch (err) {
    core.setFailed(`Unable to fetch the requested release (${cliVersion}): ${err.message}`);
  }

  // If requested version is 'latest', return latest version from cache if available
  if (cliVersion === 'latest') {
    let existingVersion = tc.find('fastly', release.data.name);
    if (existingVersion) {
      core.addPath(existingVersion);
      return;
    }
  }

  let os = platform;
  if (os === 'win32') {
    os = 'windows';
  }
  // Download requested version
  let asset = release.data.assets.find((a) => a.name.endsWith(`_${os}-amd64.tar.gz`));

  if (!asset) {
    core.setFailed(`Unable to find a suitable binary for release ${release.data.name}`);
    return;
  }

  core.info(`Downloading Fastly CLI (${release.data.name}) from ${asset.browser_download_url}`);

  // Cache downloaded binary
  let cliArchive = await tc.downloadTool(asset.browser_download_url);
  let cliPath = await tc.extractTar(cliArchive);

  const cachedPath = await tc.cacheDir(cliPath, 'fastly', release.data.name);
  core.addPath(cachedPath);
}

setup();
