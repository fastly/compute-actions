const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { Octokit } = require('@octokit/rest');
const {createActionAuth} = require('@octokit/auth-action');
const semver = require('semver');
const { platform } = require('process');

const checkBin = require('../util/bin');

async function setup() {
  try {
    await checkBin('fastly', 'version');
  } catch (err) {
    await downloadBin('fastly');
  }

  checkBin('fastly', 'version').catch((err) => {
    core.setFailed(err.message);
  });

  try {
    await checkBin('viceroy', '--version');
  } catch (err) {
    await downloadBin('viceroy');
  }

  checkBin('viceroy', '--version').catch((err) => {
    core.setFailed(err.message);
  });
}

async function downloadBin(bin) {
  let interfaceName = bin == 'fastly' ? 'cli' : bin
  let binVersion = core.getInput(`${interfaceName}_version`);

  // Normalize version string
  if (binVersion !== 'latest') {
    const valid = semver.valid(binVersion);
    if (!valid) {
      core.setFailed(`The provided ${interfaceName}_version (${binVersion}) is not a valid SemVer string.`);
      return;
    }

    binVersion = `v${valid}`;
  }

  // Check to see if requested version is cached
  let existingVersion = tc.find(bin, binVersion);
  if (existingVersion) {
    core.addPath(existingVersion);
    return;
  }

  // Fetch requested release from the relevant repo
  const octo = core.getInput('token') ? new Octokit({authStrategy: createActionAuth}) : new Octokit();
  const repo = {
    owner: 'fastly',
    repo: interfaceName,
    tag: binVersion
  };

  let release;
  try {
    release = await (binVersion === 'latest' ? octo.repos.getLatestRelease(repo) : octo.repos.getReleaseByTag(repo));
  } catch (err) {
    core.setFailed(`Unable to fetch the requested release (${binVersion}): ${err.message}`);
  }

  // If requested version is 'latest', return latest version from cache if available
  if (binVersion === 'latest') {
    let existingVersion = tc.find(bin, release.data.name);
    if (existingVersion) {
      core.addPath(existingVersion);
      return;
    }
  }

  let os = platform;
  let nameSuffix = `_${os}-amd64.tar.gz`;
  if (os === 'win32') {
    nameSuffix = '_windows-amd64.tar.gz';
  }

  // Download requested version
  let asset = release.data.assets.find((a) => a.name.endsWith(nameSuffix));

  if (!asset) {
    core.setFailed(`Unable to find a suitable binary that ends with ${nameSuffix} for release ${release.data.name}`);
    return;
  }

  core.info(`Downloading '${bin}' (${release.data.name}) from ${asset.browser_download_url}`);

  // Cache downloaded binary
  let binArchive = await tc.downloadTool(asset.browser_download_url);
  let binPath;
  if (asset.name.endsWith('.zip')) {
    binPath = await tc.extractZip(binArchive);
  } else {
    binPath = await tc.extractTar(binArchive);
  }
  const cachedPath = await tc.cacheDir(binPath, bin, release.data.name);
  core.addPath(cachedPath);
}

setup();
