import {VM} from "../../../../js/vm.js";

import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";
// implementation from https://dev.to/maxart2501/let-s-develop-a-qr-code-generator-part-iii-error-correction-1kbm

const LOG = new Uint8Array(256);
const EXP = new Uint8Array(256);
for (let exponent = 1, value = 1; exponent < 256; exponent++) {
    value = value > 127 ? ((value << 1) ^ 285) : value << 1;
    LOG[value] = exponent % 255;
    EXP[exponent % 255] = value;
}

function mul(a, b) {
    return a && b ? EXP[(LOG[a] + LOG[b]) % 255] : 0;
}


function gfMulTest(a, b, expect) {
    var testCode = `call expLogLut; ldi ${a}; ldi ${b}; call gfMul;hlt`;
    let ret = assembleTestCode(testCode);
    let state = new VM({program: ret}).run();
    assert.deepEqual(state.stack, [expect], `not correct for a=${a} b=${b}, expected ${expect} but got ${state.stack}`);
}

test('gfMul(5,123)', () => {
    gfMulTest(5, 123, mul(5, 123));
})

test('gfMul(255,255)', () => {
    gfMulTest(255, 255, mul(255, 255));
})

test('gfMul(0,0)', () => {
    gfMulTest(0, 0, mul(0,0));
})

test('gfMul(1, 2)', () => {
    gfMulTest(1, 2, mul(1, 2));
})

// slow, ensures correct output for all inputs of a & b
// test('comprehensive', () => {
//     for (let x = 0; x < 256; x++) {
//         for (let y = 0; y < 256; y++) {
//             console.log(x, y);
//             gfMulTest(x, y, mul(y, x));
//         }
//     }
// })
