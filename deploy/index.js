import core from '@actions/core';
import exec from '@actions/exec';
import artifact from '@actions/artifact';
import glob from '@actions/glob';

import path from 'path';

import checkCLI from '../util/cli';

const projectDirectory = core.getInput('project_directory');

checkCLI().then(async () => {
  const result = await exec.exec('fastly', ['compute', 'deploy'], {
    cwd: projectDirectory
  });
  return uploadArtifact(result);
}).catch((err) => {
  core.setFailed(err.message);
});

async function uploadArtifact() {
  const globber = await glob.create(path.join(projectDirectory, 'pkg', '*.tar.gz'));
  const files = await globber.glob();

  if (files.length < 1) {
    throw "There is no archive in the pkg directory to upload.";
  }

  const artifactName = path.parse(files[0]).name;

  const artifactClient = artifact.create();
  await artifactClient.uploadArtifact(artifactName, files, '.', {});
}