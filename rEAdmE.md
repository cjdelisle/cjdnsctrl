# Cjdnsctrl - tool for parsing/serializing CTRL messages

Cjdns contains a set of low level messages which are not encrypted. If you send a packet and it
cannot be forwarded, the switch which knows it is not possible to forward will notify you with
a CTRL message, these are not encrypted because obviously the switch doesn't know who you are and
can't reasonably encrypt anything to you.

## CTRL messages include

* **PING**: request that the content of the message be echo'd back to you
* **PONG**: response to a **PING** message
* **KEYPING**: Similar to a ping except that the message also sends a public key and requests one
back. **NOTE**: When constructing a keyping, remember that the key you send is your key and the
other person's key should be in the response.
* **KEYPONG**: Response to a **KEYPING** message, contains the responder's key.
* **ERROR**: Emitted by the switch in case a message cannot be forwarded.

## Types of error messages

* **MALFORMED_ADDRESS**: The switch label was malformed
* **FLOOD**: Packet dropped because link is congested (never sent as of v18)
* **LINK_LIMIT_EXCEEDED**: Packet dropped because node has oversent its limit (never sent as of v18)
* **OVERSIZE_MESSAGE**: Message too big to send, caused by differing MTU along a path
* **UNDERSIZE_MESSAGE**: Message smaller than expected headers
* **AUTHENTICATION**: Authentication failed (CryptoAuth could not understand the packet)
* **INVALID**: Header is invalid or checksum failed
* **UNDELIVERABLE**: Message could not be sent to its destination through no fault of the sender
* **LOOP_ROUTE**: The route enters and leaves through the same interface in one switch
* **RETURN_PATH_INVALID**: The switch is unable to represent the return path, this basically means
the label is so long that the inverse label is impossible to put in 64 bits.

## How to use:

input:
```javascript
const Cjdnsctrl = require('cjdnsctrl');
Cjdnsctrl.parse(new Buffer(
    "994b00050123456700000012a331ebbed8d92ac03b10efed3e389cd0c6ec7331" +
    "a72dbde198476c5eb4d14a1f02e29842b42aedb6bce2ead3", "hex"));
```

result:
```javascript
{ type: 'KEYPING',
  version: 18,
  key: '3fdqgz2vtqb0wx02hhvx3wjmjqktyt567fcuvj3m72vw5u6ubu740k3m22fplqvqwpspy93.k',
  content: <Buffer > }
```

input:
```javascript
const Cjdnsctrl = require('cjdnsctrl');
Cjdnsctrl.serialize({
    type: 'KEYPING',
    version: 18,
    key: '3fdqgz2vtqb0wx02hhvx3wjmjqktyt567fcuvj3m72vw5u6ubu740k3m22fplqvqwpspy93.k',
    content: new Buffer(0)
});
```

result:
```
<Buffer 99 4b 00 05 01 23 45 67 00 00 00 12 a3 31 eb be d8 d9 2a c0 3b 10 ef ed 3e 38 9c ... >
```
