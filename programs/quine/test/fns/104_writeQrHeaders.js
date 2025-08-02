import {VM} from "../../../../js/vm.js";

import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";


test('call writeQrHeaders with odd data size', () => {
    let testCode = `
ldi 5
stz zvQrDataSize
ldi testQrData
stz zvQrDataStart
call writeQrHeaders
hlt
testQrData:
 # AC-42
shr 
or
nop
sub
neg
    `;
    let ret = assembleTestCode(testCode);
    let state = new VM({program: ret}).run();

    // adapted example from P. 27
    let expect = [
        0b0010_0000, // 0010 mode indicator, 000000101 number input chars
        0b00101_001, // 00111001110 "AC" => 10 * 45 + 12
        0b11001110, //
        0b11100111, // 11100111001 "-4" => 41 * 45 + 4
        0b001_00001, // 000010 "2" => 2 (odd data size? last one is encoded as 6-bit number)
        0b0
    ]
    assert.deepEqual(state.mem.slice(1000), expect);
})

test('call writeQrHeaders with even data size', () => {
    let testCode = `
ldi 4
stz zvQrDataSize
ldi testQrData
stz zvQrDataStart
call writeQrHeaders
hlt
testQrData:
 # AC-4
shr 
or
nop
sub
    `;
    let ret = assembleTestCode(testCode);
    let state = new VM({program: ret}).run();

    // adapted example from P. 27
    let expect = [
        0b0010_0000, // 0010 mode indicator, 000000101 number input chars
        0b00100_001, // 00111001110 "AC" => 10 * 45 + 12
        0b11001110, //
        0b11100111, // 11100111001 "-4" => 41 * 45 + 4
        0b001
    ]
    assert.deepEqual(state.mem.slice(1000), expect);
})

