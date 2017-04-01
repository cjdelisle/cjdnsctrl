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

const Assert = require('assert');
const Cjdnsctrl = require('./index');

const GOLDS = [
    {
        bin: new Buffer("a2e5000309f91102000000124d160b1eee2929e12e19a3b1", "hex"),
        parsed: {
            type: 'PING',
            version: 18,
            key: undefined,
            content: new Buffer("4d160b1eee2929e12e19a3b1", "hex"),
            endian: 'little'
        }
    },
    {
        bin: new Buffer("497400049d74e35b0000001280534c66df69e44b496d5bc8", "hex"),
        parsed: {
            type: 'PONG',
            version: 18,
            key: undefined,
            content: new Buffer("80534c66df69e44b496d5bc8", "hex"),
            endian: 'little'
        }
    },
    {
        bin: new Buffer(
            "994b00050123456700000012a331ebbed8d92ac03b10efed3e389cd0c6ec7331" +
            "a72dbde198476c5eb4d14a1f02e29842b42aedb6bce2ead3", "hex"),
        parsed: {
            type: 'KEYPING',
            version: 18,
            key: '3fdqgz2vtqb0wx02hhvx3wjmjqktyt567fcuvj3m72vw5u6ubu70.k',
            content: new Buffer("02e29842b42aedb6bce2ead3", "hex"),
            endian: 'little'
        }
    },
    {
        bin: new Buffer(
            "3b96000689abcdef000000126bd2e8e50faca3d987623d6a043c17c0d9e9004e" +
            "145f8dd90615d34edbb36d6a02e29842b42aedb6bce2ead3", "hex"),
        parsed: {
            type: 'KEYPONG',
            version: 18,
            key: 'cmnkylz1dx8mx3bdxku80yw20gqmg0s9nsrusdv0psnxnfhqfmu0.k',
            content: new Buffer("02e29842b42aedb6bce2ead3", "hex"),
            endian: 'little'
        }
    },
    {
        bin: new Buffer(
            "bce300020000000a62c1d23a648114010379000000012d7c000006c378e071c4" +
            "6aefad3aa295fff396371d10678e9833807de083a4a40da39bf0f68f15c4380a" +
            "fbe92405196242a74bb304a8285088579f94fb01867be2171aa8d2c7b54198a8" +
            "9bbdb80c668e9c05", "hex"),
        parsed: {
            type: 'ERROR',
            errType: 'RETURN_PATH_INVALID',
            switchHeader: {
                label: '62c1.d23a.6481.1401',
                congestion: 1,
                suppressErrors: 1,
                version: 1,
                labelShift: 57,
                penalty: 0
            },
            nonce: 77180,
            additional: new Buffer(
                "000006c378e071c46aefad3aa295fff396371d10678e9833807de083a4a40da3" +
                "9bf0f68f15c4380afbe92405196242a74bb304a8285088579f94fb01867be217" +
                "1aa8d2c7b54198a89bbdb80c668e9c05", "hex"),
            endian: 'little'
        }
    }
];

GOLDS.forEach((g) => {
    const parsed = Cjdnsctrl.parse(g.bin);
    Assert.deepEqual(parsed, g.parsed);
    const bin = Cjdnsctrl.serialize(parsed);
    Assert.deepEqual(bin, g.bin);
});
