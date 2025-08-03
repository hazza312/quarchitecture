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
    testCode += `call expLogLut; ldi ${Astart}; ldi ${polynomial.length}; ldi ${n}; call gfPolyMul`;
    let ret = assembleTestCode(testCode);
    let vm = new VM({program: ret});
    var state = vm.run();

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

test('(2x^2 + 3x^1 + 1)(x + 2) => 2x^3 + 7x^2 + 7x^1 + 2', () => {
    polyMulTest([1, 3, 2, 0], 2,  [ 2, 7, 7, 2 ]);
})

test('2x * (x + 100) => x^2 + 100x', () => {
    polyMulTest([0, 2, 0], 100, [0, 200, 2]);
})

test('harder', () => {
    polyMulTest([76, 12, 9, 3, 125, 8, 1, 0], 73,  [252, 7, 55, 210, 135, 15, 65, 1]);
})

