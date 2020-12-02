const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { Octokit } = require('@octokit/rest');

const checkCLI = require('../util/cli');

try {
  await checkCLI();
} catch (err) {
  await downloadCLI();
}

checkCLI().catch((err) => {
  core.setFailed(err.message);
});

async function downloadCLI() {
  const cliVersion = core.getInput('cli_version');
  const octo = new Octokit();

  const repo = {
    owner: 'fastly',
    repo: 'cli',
    tag: cliVersion
  };

  let release = await (cliVersion === 'latest' ? octo.repos.getLatestRelease(repo) : octo.repos.getReleaseByTag(repo));

  let assets = release.data.assets.filter((a) => a.name.endsWith('_linux-amd64.tar.gz'));

  if (!assets.length < 1) {
    core.setFailed(`Unable to find a suitable binary for release ${release.data.name}`);
  }

  let asset = assets[0];

  core.info(`Downloading Fastly CLI from ${asset.url}`);

  let cliArchive = await tc.downloadTool(asset.url);
  let cliPath = await tc.extractTar(cliArchive);

  const cachedPath = await tc.cacheDir(cliPath, 'fastly', cliVersion);
  core.addPath(cachedPath);
}