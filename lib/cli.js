const program = require('commander')
const Configstore = require('configstore')
const W = require('when')
const node = require('when/node')
const exec = node.lift(require('child_process').exec)
const PgBackup = require('./index')
const pkg = require('../package.json')
const store = new Configstore(pkg.name)

module.exports = (argv) => {
  program
    .version(pkg.version)
    .option('-a --account-id [value]', 'Configure B2 account id')
    .option('-k --application-key [value]', 'Configure B2 application key')
    .option('-b --bucket-id [value]', 'Configure B2 bucket id')
    .option('-n --dbname [value]', 'Postgres database name to back up')
    .option('-s --schedule [value]', 'Add a cron task for recurring backups')
    .parse(argv)

  if (program.accountId) store.set('accountId', program.accountId)
  if (program.applicationKey) store.set('applicationKey', program.applicationKey)
  if (program.bucketId) store.set('bucketId', program.bucketId)

  const allConfig = store.all

  if (Object.keys(allConfig).length < 3) {
    return W.resolve({
      error: 'you must configure your backblaze credentials first',
      info: 'example\npg_backup --account-id xxx --application-key xxx --bucket-id xxx'
    })
  }

  const backup = new PgBackup(allConfig)
  const tasks = []

  const name = program.dbname
  if (name) {
    tasks.push(backup.run({ name })
      .then(
        () => { return { success: `database "${name}" backed up` } },
        (err) => {
          return {
            error: 'error backing up',
            raw: err
          }
        }
      ))
  }

  const schedule = program.schedule
  if (schedule) {
    let timing
    if (schedule === 'hourly') timing = '0 * * * *'
    if (schedule === 'daily') timing = '0 0 * * *'
    if (schedule === 'weekly') timing = '0 0 * * 0'
    if (schedule === 'monthly') timing = '0 0 1 * *'

    if (!timing) {
      return W.resolve({ error: 'schedule must be "hourly", "daily", "weekly", or "monthly"' })
    }

    tasks.push(addCronJob(`${timing} pg-backup ${program.dbname}`)
      .then(() => { return { success: `scheduled to back up ${schedule}` } }))
  }

  return W.all(tasks)
}

function addCronJob (cmd) {
  return exec(`echo "${cmd}" | crontab -`)
}
