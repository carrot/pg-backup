# pg-backup

[![npm](https://img.shields.io/npm/v/pg-backup.svg?style=flat-square)](https://npmjs.com/package/pg-backup)
[![tests](https://img.shields.io/travis/carrot/pg-backup.svg?style=flat-square)](https://travis-ci.org/carrot/pg-backup?branch=master)
[![dependencies](https://img.shields.io/david/carrot/pg-backup.svg?style=flat-square)](https://david-dm.org/carrot/pg-backup)
[![coverage](https://img.shields.io/coveralls/carrot/pg-backup.svg?style=flat-square)](https://coveralls.io/r/carrot/pg-backup?branch=master)

a small tool for backing up postgres databases to backblaze b2

> **Note:** This project is in early development, and versioning is a little different. [Read this](http://markup.im/#q4_cRZ1Q) for more details.

### Why should you care?

Are you running a database on a linux box? What if that box suddenly is destroyed? Back up your databases so that in the event of a catastrophe, all is well. [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html) is the lowest cost long term storage backup service on the market, and the first 10gb are free, so you will pay little-to-nothing for your peace of mind.

### Installation

`npm install pg-backup -g`

> **Note:** Postgresql must also be installed in order for pg-backup to work

### Usage

This project exposes a command line interface and a javascript API. We'll cover the use of both below.

#### CLI

In order to use the CLI, you first must configure it with your backblaze b2 API keys. To do this, run:

```sh
$ pg-backup --account-id xxx --application-key xxx --bucket-id xxx
```

You can get the account id and application key from [the b2 dashboard](https://secure.backblaze.com/b2_buckets.htm). You'll also need to create a new bucket for your database backups. Once the bucket has been created, it will show you the bucket id.

![find your b2 credentials](http://files.jenius.im/_/Q4UNMGT.jpg)

You can change your configuration details at any time. Once you have successfully authenticated, you can start backing up your databases. Test it out by backing up a database one time, manually, as such:

```sh
$ pg-backup --dbname database-name
```

If you'd like to have the database backed up at regular intervals, you can use the `--schedule` option. For example:

```sh
$ pg-backup --dbname database-name --schedule daily
```

You can have databases backed up `hourly`, `daily`, `weekly`, and `monthly`. Note that `pg-backup` will simply create a cron script to run these backups, so you must have crontab active and working in order to use the schedule option.

#### Javascript API

If you wish to use `pg-backup` through node.js, it exports a class that can be used to easily control your backups. First, you need to initialize the class with your backblaze credentials, as such:

```js
const PgBackup = require('pg-backup')

const backup = new PgBackup({
  accountId: 'xxx',
  applicationKey: 'xxx',
  bucketId: 'xxx'
})
```

Now you can quickly back up a single database with the `run` instance method, which returns a promise:

```js
backup.run({ name: 'database-name' })
  .then(console.log)
```

There are no scheduling options currently available in the javascript API. If you want long-running consistent backups, the CLI is recommended.

### Running Tests

Since we depend on B2 in order for this to work, you need a B2 account in order to run the tests. In order to add your b2 account details, run `cp test/.env.sample test/.env`, then fill in `test/.env` with your account details. Make sure that you make a new bucket for testing specifically.

### License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](contributing.md)
