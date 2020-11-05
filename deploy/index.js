const core = require('@actions/core');
const exec = require('@actions/exec');
const artifact = require('@actions/artifact');
const glob = require('@actions/glob');
const path = require('path');

const projectDirectory = core.getInput('project_directory');

checkCLI().then(() => {
  return exec.exec('fastly', ['compute', 'deploy'], {
    cwd: projectDirectory
  }).then(uploadArtifact);
}).catch((err) => {
  core.setFailed(err.message);
});

async function uploadArtifact() {
  const globber = await glob.create(path.join(projectDirectory, 'pkg/*'));
  const files = await globber.glob();

  if (files.length < 1) {
    throw "There is no archive in the pkg directory to upload.";
  }

  const artifactName = path.parse(files[0]).name;

  const artifactClient = artifact.create();
  const uploadResponse = await artifactClient.uploadArtifact(artifactName, files, '.', {});
}

async function checkCLI() {
  try {
    await exec.exec('fastly', 'version')
  } catch (err) {
    throw "Fastly CLI is not installed. Use the fastly/compute-actions/setup action to automatically install and cache it.";
  }
}