const core = require('@actions/core');
const exec = require('@actions/exec');

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

  await exec.exec('fastly', params, {
    cwd: projectDirectory
  });
}).catch((err) => {
  core.setFailed(err.message);
});
