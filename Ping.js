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

const Common = require('./Common');
const Cjdnskeys = require('cjdnskeys');

const TYPES = {
    PING: {
        magic: 0x09f91102,
        minSize: 8,
        maxSize: 256,
        hdrSize: 8
    },
    PONG: {
        magic: 0x9d74e35b,
        minSize: 8,
        maxSize: 256,
        hdrSize: 8
    },
    KEYPING: {
        magic: 0x01234567,
        minSize: 40,
        maxSize: 40 + 64,
        hdrSize: 40
    },
    KEYPONG: {
        magic: 0x89abcdef,
        minSize: 40,
        maxSize: 40 + 64,
        hdrSize: 40
    }
};

/*::
export type Ping_Type_t = "PING"|"PONG"|"KEYPING"|"KEYPONG";
export type Ping_t = {
    type: Ping_Type_t,
    version: number,
    key: ?string,
    content: Buffer
};
*/

const parse = module.exports.parse = (buf /*:Buffer*/, type /*:Ping_Type_t*/) /*:Ping_t*/ => {
    const magic = buf.readUInt32BE(0);
    if (magic !== TYPES[type].magic) {
        throw new Error("invalid magic [" + magic.toString(16) + "] expected [" +
            TYPES[type].magic.toString(16) + "] for type [" + type + "]");
    }
    let remainder = buf.slice(8);
    let key;
    if (type.indexOf('KEY') === 0) {
        key = Cjdnskeys.keyBytesToString(remainder.slice(0, 32));
        remainder = remainder.slice(32);
    }
    return {
        type: type,
        version: buf.readUInt32BE(4),
        key: key,
        content: remainder
    };
};

const serialize = module.exports.serialize = (obj /*:Ping_t*/) => {
    if (!(obj.type in TYPES)) { throw new Error("type not recognized " + obj.type); }
    const typedata = TYPES[obj.type];
    const version = obj.version;
    if (!version) { throw new Error("version missing"); }
    const out = [
        Common.uint32Buff(typedata.magic),
        Common.uint32Buff(version)
    ];
    if (obj.type.indexOf('KEY') === 0) {
        if (!obj.key) { throw new Error("type is KEY but there is no key specified"); }
        out.push(Cjdnskeys.keyStringToBytes(obj.key));
    }
    out.push(obj.content);
    return Buffer.concat(out);
};
