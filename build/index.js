import core from '@actions/core';
import exec from '@actions/exec';

import checkCLI from '../util/cli';

checkCLI().then(() => {
  return exec.exec('fastly', ['compute', 'build'],  {
    cwd: core.getInput('project_directory')
  });
}).catch((err) => {
  core.setFailed(err.message);
});