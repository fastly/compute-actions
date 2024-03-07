const exec = require('@actions/exec');

module.exports = async function checkViceroy() {
  try {
    await exec.exec('viceroy', '--version')
  } catch (err) {
    throw "Viceroy is not installed. Use the fastly/compute-actions/setup action to automatically install and cache it.";
  }
}
