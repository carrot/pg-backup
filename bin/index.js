const PgBackup = require('..')
const program = require('commander')
const Configstore = require('configstore')
const chalk = require('chalk')
const cron = require('../lib/cron')
const pkg = require('../package.json')
const store = new Configstore(pkg.name)

program
  .version(pkg.version)
  .option('-a --account-id', 'Configure B2 account id')
  .option('-k --application-key', 'Configure B2 application key')
  .option('-b --bucket-id', 'Configure B2 bucket id')
  .option('-n --name', 'Postgres database name to back up')
  .option('-s --schedule', 'Add a cron task for recurring backups')
  .parse(process.argv)

if (program.accountId) store.set('accountId', program.accountId)
if (program.applicationKey) store.set('applicationKey', program.applicationKey)
if (program.bucketId) store.set('bucketId', program.bucketId)

const backup = new PgBackup(store.all)

const name = program.name
if (name) {
  backup.run({ name })
    .done(
      () => console.log(chalk.green(`✓ ${name} backed up`)),
      (err) => {
        console.error(chalk.red(`× ${name} error backing up`))
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
  cron.add(`${timing} pg-backup ${program.name}`)
    .done(() => {
      console.log(chalk.green(`✓ scheduled to back up ${schedule}`))
    })
}
