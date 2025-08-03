import {VM} from "../../../../js/vm.js";

import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";


function polyMulTest(polynomial, n, expect) {
    var testCode = '';
    let A = 10000, Astart = 10000;

    for (let c of polynomial) {
        testCode += `ldi ${c}; ldi ${A}; st;`;
        A += 1;
    }
    testCode += `ldi ${Astart}; ldi ${polynomial.length}; ldi ${n}; call polyMul`;
    let ret = assembleTestCode(testCode);
    let state = new VM({program: ret}).run();
    console.log(state);
    let mem = state.mem.slice(Astart, Astart + polynomial.length);
    assert.deepEqual(mem, expect);
}

test('x * (x + 0) => x^2', () => {
    polyMulTest([1, 0], 0, [0, 1]);
})

test('(2x^2 + 3x^1 + 1)(x)', () => {
    polyMulTest([1, 3, 2, 0], 0, [0, 1, 3, 2]);
})

test('x * (x + 1) => x^2 + x', () => {
    polyMulTest([1, 0], 1, [1, 1]);
})

test('(2x^2 + 3x^1 + 1)(x + 2)', () => {
    polyMulTest([1, 3, 2, 0], 2, [2, 7, 7, 2]);
})




