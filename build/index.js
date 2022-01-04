const core = require('@actions/core');
const exec = require('@actions/exec');

const checkCLI = require('../util/cli');

checkCLI().then(() => {
  return exec.exec('fastly', ['compute', 'build', '-v'],  {
    cwd: core.getInput('project_directory')
  });
}).catch((err) => {
  core.setFailed(err.message);
});
