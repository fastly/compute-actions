const core = require('@actions/core');
const exec = require('@actions/exec');

const checkCLI = require('../util/cli');

const verbose = core.getBooleanInput('verbose');
const skipVerification = core.getBooleanInput('skip_verification');

checkCLI().then(() => {
  let params = ['compute', 'build', '--non-interactive'];
  if (skipVerification) params.push('--skip-verification');
  if (verbose) params.push('--verbose');

  return exec.exec('fastly', params, {
    cwd: core.getInput('project_directory')
  });
}).catch((err) => {
  core.setFailed(err.message);
});
