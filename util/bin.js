const exec = require('@actions/exec');

module.exports = async function checkBin(bin, arg) {
  try {
    await exec.exec(bin, arg)
  } catch (err) {
    throw `The '${bin}' CLI is not installed. Use the fastly/compute-actions/setup action to automatically install and cache it.`;
  }
}
