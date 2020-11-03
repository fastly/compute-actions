const core = require('@actions/core');
const exec = require('@actions/exec');

checkCLI().then(() => {
  return exec.exec('fastly', ['compute', 'deploy'], {
    cwd: core.getInput('project_directory')
  });
}).catch((err) => {
  core.setFailed(err.message);
});

async function checkCLI() {
  try {
    await exec.exec('fastly', 'version')
  } catch (err) {
    throw "Fastly CLI is not installed. Use the fastly/compute-actions/setup action to automatically install and cache it.";
  }
}