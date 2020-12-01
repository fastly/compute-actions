import core from '@actions/core';
import tc from '@actions/tool-cache';

import checkCLI from '../util/cli';

// Download URL for latest Fastly CLI release
const cliVersion = "v0.19.0";
const downloadURL = `https://github.com/fastly/cli/releases/download/${cliVersion}/fastly_${cliVersion}_linux-amd64.tar.gz`;

try {
  await checkCLI();
} catch (err) {
  await downloadCLI();
}

checkCLI().catch((err) => {
  core.setFailed(err.message);
});

async function downloadCLI() {
  core.info(`Downloading Fastly CLI from ${downloadURL}`);

  let cliArchive = await tc.downloadTool(downloadURL);
  let cliPath = await tc.extractTar(cliArchive);

  const cachedPath = await tc.cacheDir(cliPath, 'fastly', cliVersion);
  core.addPath(cachedPath);
}