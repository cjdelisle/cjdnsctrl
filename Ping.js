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

const parse = module.exports.parse = (buf, type) => {
    const out = {
        type: type,
        version: buf.readUInt32BE(4)
    };
    const magic = buf.readUInt32BE();
    if (magic !== TYPES[type].magic) {
        throw new Error("invalid magic [" + magic.toString(16) + "] expected [" +
            TYPES[type].magic.toString(16) + "] for type [" + type + "]");
    }
    let remainder = buf.slice(8);
    if (type.indexOf('KEY') === 0) {
        out.key = Cjdnskeys.keyBytesToString(remainder.slice(0, 64));
        remainder = remainder.slice(64);
    }
    out.content = remainder;
    return out;
};

const serialize = module.exports.serialize = (obj) => {
    if (!(obj.type in TYPES)) { throw new Error("type not recognized " + obj.type); }
    const typedata = TYPES[obj.type];
    const version = obj.version;
    if (!version) { throw new Error("version missing"); }
    const out = [
        Common.uint32Buff(typedata.magic),
        Common.uint32Buff(version)
    ];
    if (obj.type.indexOf('KEY') === 0) { out.push(Cjdnskeys.keyStringToBytes(obj.key)); }
    out.push(obj.content);
    return Buffer.concat(out);
};
