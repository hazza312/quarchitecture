import {VM} from "../../../../js/vm.js";
import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";

function assertStack(bits, expect) {
    let testBin = assembleTestCode(bits.map(b => `ldi ${b}\ncall appendBitToBitString`).join("\n"));
    let state = new VM({program: testBin}).run();
    assert.deepEqual(state.mem.slice(1000), expect);
}

test('simple single byte', () => {
    assertStack([1], [1]);
})

test('simple single byte 2', () => {
    assertStack([1, 0, 1, 0, 1, 0, 1, 0], [170]);
})

test('multibyte 1', () => {
    assertStack([1, 0, 1, 0, 1, 0, 1, 0, 1, 1], [170, 3]);
})

