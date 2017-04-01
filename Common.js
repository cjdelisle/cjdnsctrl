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

const uint32Buff = module.exports.uint32Buff = (num /*:number*/) => {
    const b = new Buffer(4);
    b.writeUInt32BE(num, 0);
    return b;
};

const uint16Buff = module.exports.uint16Buff = (num /*:number*/) => {
    const b = new Buffer(2);
    b.writeUInt16BE(num, 0);
    return b;
};
