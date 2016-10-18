require('dotenv').config()
const PgBackup = require('..')
const cli = require('../lib/cli')
const test = require('ava')

test('basic', (t) => {
  const backup = new PgBackup({
    accountId: process.env.B2_ACCOUNT_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
    bucketId: process.env.B2_BUCKET_ID
  })

  return backup.run({ name: 'postgres' })
})

test('cli error', (t) => {
  return runCli('-n foo').then((res) => {
    t.is(res[0].error, 'error backing up')
  })
})

test('cli', (t) => {
  return runCli(`-a ${process.env.B2_ACCOUNT_ID} -k ${process.env.B2_APPLICATION_KEY} -b ${process.env.B2_BUCKET_ID} -n postgres`).then((res) => {
    t.is(res[0].success, 'database "postgres" backed up')
  })
})

function runCli (str) {
  const arr = str.split(' ')
  arr.unshift('/usr/local/bin/node')
  arr.unshift('path/to/bin')
  return cli(arr)
}
