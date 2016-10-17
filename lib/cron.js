const node = require('when/node')
const exec = node.lift(require('child_process').exec)

module.exports = {
  add: (cmd) => exec(`echo "${cmd}" | crontab -`)
}
