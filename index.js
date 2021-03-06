/*@flow*/
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
    'KEYPONG': 6,
    'GETSNODEQ': 7,
    'GETSNODER': 8,
};
const RTYPE = {};
for (const t in TYPE) { RTYPE[TYPE[t]] = t; }

const typeNum = module.exports.typeNum =
    (e /*:number|string*/) => (TYPE[e] || TYPE[RTYPE[e]]);
const typeString = module.exports.typeString =
    (e /*:number|string*/) => (RTYPE[e] || RTYPE[TYPE[e]]);

// Size of the header plus size of a keyping which is the smallest message
const MINSIZE = module.exports.MINSIZE = 4 + 40;

/*::
import type { Ping_Type_t, Ping_t } from './Ping'
export type Cjdnsctrl_Ping_Type_t = Ping_Type_t
export type Cjdnsctrl_Ping_t = Ping_t

import type { ErrMsg_t } from './ErrMsg'
export type Cjdnsctrl_ErrMsg_t = ErrMsg_t

export type Cjdnsctrl_t = Ping_t | ErrMsg_t
*/

const parse = module.exports.parse = (bytes /*:Buffer*/) => {
    //if (bytes.length < MINSIZE) { throw new Error("runt"); }
    // We don't have 1s complement in js so we can't check this, ignore...
    const checksum = bytes.readUInt16BE(0);
    bytes.writeUInt16BE(0, 0);
    const realChecksum = NetChecksum.raw(bytes);
    bytes.writeUInt16BE(checksum, 0);
    let endian = 'little';
    if (realChecksum !== checksum) {
        if (realChecksum === ((checksum << 8 & 0xff00) | (checksum >>> 8 & 0xff))) {
            endian = 'big';
        } else {
            throw new Error(
                "invalid checksum, expected [" + realChecksum + "] got [" + checksum + "]");
        }
    }
    const type = typeString(bytes.readUInt16BE(2));
    const content = bytes.slice(4);
    let out;
    switch (type) {
        case 'ERROR': out = ErrMsg.parse(content); break;
        case 'PING':
        case 'PONG':
        case 'KEYPING':
        case 'KEYPONG': out = Ping.parse(content, type); break;
        default: throw new Error("could not parse, unknown type CTRL packet " + type);
    }
    // $FlowFixMe property not specified in object literal.
    out.endian = endian;
    return out;
};

const serialize = module.exports.serialize = (obj /*:Cjdnsctrl_t*/) => {
    const out = [ new Buffer("\0\0") ];
    const typeN = typeNum(obj.type);
    if (!typeN) { throw new Error("missing or unrecognized message type [" + obj.type + "]"); }
    out.push(Common.uint16Buff(typeN));
    switch (obj.type) {
        case 'ERROR': out.push(ErrMsg.serialize(obj)); break;
        case 'PING':
        case 'PONG':
        case 'KEYPING':
        case 'KEYPONG': out.push(Ping.serialize(obj)); break;
        default: throw new Error("unreachable");
    }
    const b = Buffer.concat(out);
    const cs = NetChecksum.raw(b);
    b.writeUInt16BE(cs, 0);
    return b;
};
