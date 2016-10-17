require('dotenv').config()
const PgBackup = require('..')
const test = require('ava')

test('basic', (t) => {
  const backup = new PgBackup({
    accountId: process.env.B2_ACCOUNT_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
    bucketId: process.env.B2_BUCKET_NAME
  })

  return backup.run({ name: 'postgres' }).then(console.log)
})
