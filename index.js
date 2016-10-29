/* vim: set expandtab ts=4 sw=4: */
/*
 * You may redistribute this program and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

const ErrMsg = require('./ErrMsg');
const Ping = require('./Ping');
const Common = require('./Common');
const NetChecksum = require('netchecksum');

const TYPE = {
    'ERROR': 2,
    'PING': 3,
    'PONG': 4,
    'KEYPING': 5,
    'KEYPONG': 6
};
const RTYPE = {};
for (const t in TYPE) { RTYPE[TYPE[t]] = t; }

const typeNum = module.exports.typeNum = (e) => { return TYPE[e] || TYPE[RTYPE[e]]; };
const typeString = module.exports.typeString = (e) => { return RTYPE[e] || RTYPE[TYPE[e]]; };

// Size of the header plus size of a keyping which is the smallest message
const MINSIZE = module.exports.MINSIZE = 4 + 40;

const parse = module.exports.parse = (bytes) => {
    //if (bytes.length < MINSIZE) { throw new Error("runt"); }
    // We don't have 1s complement in js so we can't check this, ignore...
    const checksum = bytes.readUInt16BE();
    bytes.writeUInt16BE(0);
    const realChecksum = NetChecksum.raw(bytes);
    bytes.writeUInt16BE(checksum);
    if (realChecksum !== checksum) {
        throw new Error("invalid checksum, expected [" + realChecksum + "] got [" + checksum + "]");
    }
    const type = typeString(bytes.readUInt16BE(2));
    const content = bytes.slice(4);
    switch (type) {
        case 'ERROR': return ErrMsg.parse(content);
        case 'PING':
        case 'PONG':
        case 'KEYPING':
        case 'KEYPONG': return Ping.parse(content, type);
        default: throw new Error("could not parse, unknown type CTRL packet " + type);
    }
};

const serialize = module.exports.serialize = (obj) => {
    const out = [ new Buffer("\0\0") ];
    const typeN = typeNum(obj.type);
    if (!typeN) { throw new Error("missing or unrecognized message type [" + obj.type + "]"); }
    out.push(Common.uint16Buff(typeN));
    switch (obj.type) {
        case 'ERROR': out.push(ErrMsg.serialize(obj)); break;
        case 'PING':
        case 'PONG':
        case 'KEYPING':
        case 'KEYPONG': out.push(Ping.serialize(obj, obj.type)); break;
        default: throw new Error("unreachable");
    }
    const b = Buffer.concat(out);
    const cs = NetChecksum.raw(b);
    b.writeUInt16BE(cs);
    return b;
};
