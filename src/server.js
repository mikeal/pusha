const pushServer = require('graph-push').server
const http = require('http')
const unixfs = require('js-unixfsv2-draft')

class Pusha {
  constructor (options) {
    if (typeof options.server === 'undefined') {
      options.server = true
    }
    let server
    if (options.server === true) {
      server = http.createServer()
    } else {
      server = options.server
    }
    let get = options.get
    let put = options.put
    let has = options.has
    let getUrl = options.getUrl
    let getCID = options.getCID
    let pusher = pushServer({server, has, put})
    pusher.onDeploy = (...args) => {
      return this.onDeploy(...args)
    }
    this.listen = (...args) => server.listen(...args)
    this.close = (...args) => server.close(...args)
    server.on('request', (req, res) => this.onRequest(req, res))

    this._settings = { get, put, has, getUrl, getCID }
  }
  async onDeploy (block, count) {
    return this._settings.getUrl(block)
  }
  async onRequest (req, res) {
    let {cid, path} = await this._settings.getCID(req.url)
    if (path.length && path[0] !== '/') path = '/' + path

    let filepath = req.url.slice(path.length)

    res.setHeader('pusha-root', cid.toBaseEncodedString())

    let reader = unixfs.fs(cid, cid => this._settings.get(cid))
    let blockIterator = reader.serve(filepath, req, res)
  }
}

module.exports = (...args) => new Pusha(...args)
