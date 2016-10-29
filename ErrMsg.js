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

const Cjdnshdr = require('cjdnshdr');
const Common = require('./Common');

const ERROR_C_STR = `
/** No error, everything is ok. */
#define Error_NONE                 0

/** The switch label was malformed. */
#define Error_MALFORMED_ADDRESS    1

/** Packet dropped because link is congested. */
#define Error_FLOOD                2

/** Packet dropped because node has oversent its limit. */
#define Error_LINK_LIMIT_EXCEEDED  3

/** Message too big to send. */
#define Error_OVERSIZE_MESSAGE     4

/** Message smaller than expected headers. */
#define Error_UNDERSIZE_MESSAGE    5

/** Authentication failed. */
#define Error_AUTHENTICATION       6

/** Header is invalid or checksum failed. */
#define Error_INVALID              7

/** Message could not be sent to its destination through no fault of the sender. */
#define Error_UNDELIVERABLE        8

/** The route enters and leaves through the same interface in one switch. */
#define Error_LOOP_ROUTE           9

/** The switch is unable to represent the return path. */
#define Error_RETURN_PATH_INVALID 10
`;

const ERRORS = {};
const RERRORS = {};

ERROR_C_STR.split('\n').forEach((x) => {
    x.replace(/^#define Error_([^ ]*) *([0-9]*)$/, (all, x, y) => {
        ERRORS[x] = y;
        RERRORS[y] = x;
    });
});

const typeNum = module.exports.typeNum = (e) => ( ERRORS[e] || ERRORS[RERRORS[e]] );
const typeString = module.exports.typeString = (e) => ( RERRORS[e] || RERRORS[ERRORS[e]] );

const parse = module.exports.parse = (buf) => {
    const type = buf.readUInt32BE();
    let additional = buf.slice(4);
    const out = {
        type: 'ERROR',
        errType: typeString(type) || ('unknown: ' + type)
    };
    if (additional.length >= Cjdnshdr.SwitchHeader.SIZE) {
        out.switchHeader = Cjdnshdr.SwitchHeader.parse(additional);
        additional = additional.slice(Cjdnshdr.SwitchHeader.SIZE);
    }
    if (additional.length > 4) {
        out.nonce = additional.readUInt32BE();
        additional = additional.slice(4);
    }
    out.additional = additional;
    return out;
};

const serialize = module.exports.serialize = (obj) => {
    const result = [ ];
    if (obj.type !== 'ERROR') { throw new Error("obj not of type ERROR, it's " + obj.type); }
    const typeN = typeNum(obj.errType);
    if (!typeString(typeN)) { throw new Error("errType " + obj.errType + " unrecognized"); }
    result.push(Common.uint32Buff(typeN));
    if (obj.switchHeader) { result.push(Cjdnshdr.SwitchHeader.serialize(obj.switchHeader)); }
    if (obj.nonce) { result.push(Common.uint32Buff(obj.nonce)); }
    if (!obj.additional) { throw new Error("missing obj.additional"); }
    result.push(obj.additional);
    return Buffer.concat(result);
};
