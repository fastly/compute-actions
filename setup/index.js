const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');

// Download URL for latest Fastly CLI release
const cliVersion = "v0.18.1";
const downloadURL = `https://github.com/fastly/cli/releases/download/${cliVersion}/fastly_${cliVersion}_linux-amd64.tar.gz`;

checkCLI().then(() => {
  exec.exec('fastly', 'version');
}).catch((err) => {
  core.setFailed(err.message);
});

async function checkCLI() {
  try {
    await exec.exec('fastly', 'version')
  } catch (err) {
    return await downloadCLI();
  }
}

async function downloadCLI() {
  core.info(`Downloading Fastly CLI from ${downloadURL}`);

  let cliArchive = await tc.downloadTool(downloadURL);
  let cliPath = await tc.extractTar(cliArchive);

  const cachedPath = await tc.cacheDir(cliPath, 'fastly', cliVersion);
  core.addPath(cachedPath);
}