const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { Octokit } = require('@octokit/rest');
const semver = require('semver');

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

  if (cliVersion !== 'latest') {
    const valid = semver.valid(cliVersion);
    if (!valid) {
      core.setFailed(`The provided cli_version (${cliVersion}) is not a valid SemVer string.`);
      return;
    }

    cliVersion = `v${valid}`;
  }

  const existingVersion = tc.find('fastly', cliVersion);

  if (existingVersion) {
    core.addPath(existingVersion);
    return;
  }

  const octo = new Octokit();
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

  let asset = release.data.assets.find((a) => a.name.endsWith('_linux-amd64.tar.gz'));

  if (!asset) {
    core.setFailed(`Unable to find a suitable binary for release ${release.data.name}`);
    return;
  }

  core.info(`Downloading Fastly CLI (${cliVersion}) from ${asset.browser_download_url}`);

  let cliArchive = await tc.downloadTool(asset.browser_download_url);
  let cliPath = await tc.extractTar(cliArchive);

  const cachedPath = await tc.cacheDir(cliPath, 'fastly', cliVersion);
  core.addPath(cachedPath);
}

setup();
