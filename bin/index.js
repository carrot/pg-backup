#!/usr/bin/env node

const chalk = require('chalk')
const cli = require('../lib/cli')

cli(process.argv).done((res) => {
  res = Array.prototype.concat(res)
  res.map((r) => {
    for (let k in r) {
      if (k === 'success') console.log(chalk.green(`✓ ${r[k]}`))
      if (k === 'error') console.error(chalk.red(`× ${r[k]}`))
      if (k === 'info') console.log(chalk.grey(`▸ ${r[k]}`))
      if (k === 'raw') console.log(r[k])
    }
  })
}, console.error)
