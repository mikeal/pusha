const {client} = require('graph-push')
const unixfs = require('js-unixfsv2-draft')

const push = async (dir, url) => {
  let db = new Map()
  let last
  for await (let block of unixfs.dir(dir)) {
    db.set(block.cid.toBaseEncodedString(), block.data)
    last = block
  }
  let get = cid => db.get(cid.toBaseEncodedString())
  let result = await client(url, last, get)
  return result
}

module.exports = push
