const core = require('@actions/core');
const exec = require('@actions/exec');

const checkCLI = require('../util/cli');

const verbose = core.getBooleanInput('verbose');

checkCLI().then(() => {
  let params = ['compute', 'build', '--non-interactive'];
  if (verbose) params.push('--verbose');

  return exec.exec('fastly', params, {
    cwd: core.getInput('project_directory')
  });
}).catch((err) => {
  core.setFailed(err.message);
});
