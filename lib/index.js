const B2 = require('backblaze-b2')
const W = require('when')
const node = require('when/node')
const exec = node.lift(require('child_process').exec)

module.exports = class PgBackup {
  constructor (opts) {
    this.accountId = opts.accountId
    this.applicationKey = opts.applicationKey
    this.bucketId = opts.bucketId
    this.b2 = new B2({
      accountId: this.accountId,
      applicationKey: this.applicationKey
    })
    this.auth = this._authorize()
  }

  run (opts) {
    const dumpTask = exec(`pg_dump ${opts.name}`).then((r) => r[0])
    const uploadUrlTask = this.auth
      .then(() => this.b2.getUploadUrl(this.bucketId))

    return W.all([uploadUrlTask, dumpTask]).then(([uurl, dump]) => {
      if (uurl.message) return new Error(uurl.message)
      return this.b2.uploadFile({
        uploadUrl: uurl.uploadUrl,
        uploadAuthToken: uurl.authorizationToken,
        filename: opts.name,
        data: dump
      })
    })
  }

  _authorize (opts) {
    return W(this.b2.authorize()).tap((b) => {
      console.log(b)
      this.b2 = Object.assign(this.b2, b)
    })
  }
}
