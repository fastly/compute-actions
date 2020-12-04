const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { Octokit } = require('@octokit/rest');

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
  const cliVersion = core.getInput('cli_version');
  const octo = new Octokit();

  const repo = {
    owner: 'fastly',
    repo: 'cli',
    tag: cliVersion
  };

  let release = await (cliVersion === 'latest' ? octo.repos.getLatestRelease(repo) : octo.repos.getReleaseByTag(repo));

  let asset = release.data.assets.find((a) => a.name.endsWith('_linux-amd64.tar.gz'));

  if (!asset) {
    core.setFailed(`Unable to find a suitable binary for release ${release.data.name}`);
  }


  core.info(`Downloading Fastly CLI from ${asset.browser_download_url}`);

  let cliArchive = await tc.downloadTool(asset.browser_download_url);
  let cliPath = await tc.extractTar(cliArchive);

  const cachedPath = await tc.cacheDir(cliPath, 'fastly', cliVersion);
  core.addPath(cachedPath);
}

setup();
