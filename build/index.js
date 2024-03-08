const core = require('@actions/core');
const exec = require('@actions/exec');

const checkBin = require('../util/bin');

const verbose = core.getBooleanInput('verbose');

checkBin('fastly', 'version').then(() => {
  let params = ['compute', 'build', '--non-interactive'];
  if (verbose) params.push('--verbose');

  return exec.exec('fastly', params, {
    cwd: core.getInput('project_directory')
  });
}).catch((err) => {
  core.setFailed(err.message);
});
