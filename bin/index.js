#!/usr/bin/env node

const PgBackup = require('..')
const program = require('commander')
const Configstore = require('configstore')
const chalk = require('chalk')
const cron = require('../lib/cron')
const pkg = require('../package.json')
const store = new Configstore(pkg.name)

program
  .version(pkg.version)
  .option('-a --account-id [value]', 'Configure B2 account id')
  .option('-k --application-key [value]', 'Configure B2 application key')
  .option('-b --bucket-id [value]', 'Configure B2 bucket id')
  .option('-n --dbname [value]', 'Postgres database name to back up')
  .option('-s --schedule [value]', 'Add a cron task for recurring backups')
  .parse(process.argv)

if (program.accountId) store.set('accountId', program.accountId)
if (program.applicationKey) store.set('applicationKey', program.applicationKey)
if (program.bucketId) store.set('bucketId', program.bucketId)
const allConfig = store.all

if (Object.keys(allConfig).length < 3) {
  errorLog('you must configure your backblaze credentials first')
  infoLog('example:')
  infoLog('pg-backups --account-id xxx --application-key xxx --bucket-id xxx')
} else {
  const backup = new PgBackup(allConfig)

  const name = program.dbname
  if (name) {
    backup.run({ name })
      .done(
        () => successLog(`database "${name}" backed up`),
        (err) => {
          errorLog('error backing up')
          console.error(err)
        }
      )
  }

  const schedule = program.schedule
  if (schedule) {
    let timing
    if (schedule === 'hourly') timing = '0 * * * *'
    if (schedule === 'daily') timing = '0 0 * * *'
    if (schedule === 'weekly') timing = '0 0 * * 0'
    if (schedule === 'monthly') timing = '0 0 1 * *'

    if (!timing) {
      errorLog('schedule must be "hourly", "daily", "weekly", or "monthly"')
    } else {
      cron.add(`${timing} pg-backup ${program.dbname}`)
        .done(() => successLog(`scheduled to back up ${schedule}`))
    }
  }
}

function successLog (msg) {
  console.log(chalk.green(`✓ ${msg}`))
}

function errorLog (msg) {
  console.error(chalk.red(`× ${msg}`))
}

function infoLog (msg) {
  console.log(chalk.grey(`▸ ${msg}`))
}
