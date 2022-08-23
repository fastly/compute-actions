const core = require('@actions/core');
const exec = require('@actions/exec');
const artifact = require('@actions/artifact');
const glob = require('@actions/glob');
const path = require('path');

const checkCLI = require('../util/cli');

const projectDirectory = core.getInput('project_directory');
const serviceId = core.getInput('service_id');
const serviceName = core.getInput('service_name');
const comment = core.getInput('comment');
const verbose = core.getBooleanInput('verbose');

checkCLI().then(async () => {
  let params = ['compute', 'deploy'];
  if (serviceId !== 'default') params.push('--service-id=' + serviceId);
  if (serviceId === 'default' && serviceName !== 'default') params.push('--service-name=' + serviceName);
  if (verbose) params.push('--verbose');
  if (comment) params.push('--comment=' + comment);

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

  const artifactClient = artifact.create();
  await artifactClient.uploadArtifact(artifactName, files, '.', {});
}
