const core = require('@actions/core');
const exec = require('@actions/exec');

const checkCLI = require('../util/cli');

const verbose = core.getInput('verbose');

checkCLI().then(() => {
  let params = ['compute', 'build'];
  if (verbose) params.push('--verbose');
  return exec.exec('fastly', params,  {
    cwd: core.getInput('project_directory')
  });
}).catch((err) => {
  core.setFailed(err.message);
});
