const core = require('@actions/core');
const exec = require('@actions/exec');
const { DefaultArtifactClient } = require("@actions/artifact");
const glob = require('@actions/glob');
const path = require('path');

const checkBin = require('../util/bin');

const projectDirectory = core.getInput('project_directory');
const serviceId = core.getInput('service_id');
const comment = core.getInput('comment');
const verbose = core.getBooleanInput('verbose');
const version = core.getInput('version');

checkBin('fastly', 'version').then(async () => {
  let params = ['compute', 'deploy', '--non-interactive'];
  if (serviceId !== 'default') params.push('--service-id=' + serviceId);
  if (verbose) params.push('--verbose');
  if (comment) params.push('--comment=' + comment);
  if (version) params.push('--version=' + version);

  const result = await exec.exec('fastly', params, {
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

  const artifactClient = new DefaultArtifactClient();
  await artifactClient.uploadArtifact(artifactName, files, '.', {});
}
