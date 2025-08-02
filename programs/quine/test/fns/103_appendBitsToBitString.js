import {VM} from "../../../../js/vm.js";

import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";

function assertBitString(val, nBits, expect) {
    let testCode = `
        ldi ${val}
        ldi ${nBits}
        call appendBitsToBitString
    `;
    let ret = assembleTestCode(testCode);
    let state = new VM({program: ret}).run();
    assert.deepEqual(state.mem.slice(1000), expect);
}

test('simple single byte', () => {
    assertBitString(0b11111, 5, [0b11111]);
})

test('simple single byte 2', () => {
    assertBitString(0b00100001, 8, [0b00100001]);
})

