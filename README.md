# Pusha

Content addressable static deployments.

Under the hood, uses IPLD (the datatype IPFS uses) and the IPFS unixfs-v2
draft for representing a file tree in `dag-cbor`.

## Usage

```
# pusha static/ mysite.com
> static/ directory converted to 342 blocks in 1.1 seconds.
> pushed 34 new blocks to mysite.com
> deployment available at zdpuAsJmoGcH8BWb1DWTTxAJNmC2uESoUQXdZwfbyx7J8d9rt.mysite.com
```

```javascript
const {server} = require('./')

let _server = server({
  { get, put, has, getUrl, getCID }
})
```

