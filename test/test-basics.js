const {server, client} = require('../')
const {test} = require('tap')
const CID = require('cids')
const parseURL = require('url').parse
const bent = require('bent')
const path = require('path')
const getreq = bent()

let PORT = 8765

const mkopts = (db, port) => {
  return {
    get: async cid => {
      cid = cid.toBaseEncodedString()
      return db.get(cid) || null
    },
    has: async cid => {
      cid = cid.toBaseEncodedString()
      return db.has(cid)
    },
    put: async (cid, buffer) => {
      cid = cid.toBaseEncodedString()
      db.set(cid, buffer)
    },
    getUrl: async (block) => {
      return `http://localhost:${port}/${block.cid.toBaseEncodedString()}`
    },
    getCID: async (url) => {
      let u = parseURL(url)
      let cid = u.pathname.split('/').filter(x => x)[0]
      return {cid: new CID(cid), path: `/${cid}`}
    }
  }
}

const gptest = (str, handler) => {
  PORT++
  let db = new Map()
  let _server = server(mkopts(db, PORT))
  _server.db = db
  let url = `ws://localhost:${PORT}`
  _server.listen(PORT, async () => {
    await test(str, t => handler(t, url, db, PORT))
    _server.close()
  })
}

const fixture = path.join(__dirname, 'fixture')

let getBuffer = stream => new Promise((resolve, reject) => {
  stream.on('error', reject)
  let parts = []
  stream.on('data', chunk => parts.push(chunk))
  stream.on('end', () => {
    resolve(Buffer.concat(parts))
  })
})

gptest('basics: push fixture', async (t, url, db) => {
  let result = await client(fixture, url)
  t.ok(result.deploy.startsWith('http://localhost:'))
  t.same(result.deploy.length, 71)
  t.same(db.size, 6)
})

gptest('basics: get /', async (t, url, db) => {
  let {deploy} = await client(fixture, url)
  let res = await getreq(deploy)
  t.same(res.headers['content-type'], 'text/html; charset=utf-8')
  let buffer = await getBuffer(res)
  t.same(buffer.toString(), 'Hello world index.')
})
