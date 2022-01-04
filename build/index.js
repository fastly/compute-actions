const core = require('@actions/core');
const exec = require('@actions/exec');

const checkCLI = require('../util/cli');

const skipVerification = core.getBooleanInput('skip_verification');

checkCLI().then(() => {
  let params = ['compute', 'build', '-v'];
  if (skipVerification) params.push('--skip-verification');
  return exec.exec('fastly', params,  {
    cwd: core.getInput('project_directory')
  });
}).catch((err) => {
  core.setFailed(err.message);
});
