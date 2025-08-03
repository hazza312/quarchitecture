import {VM} from "../../../../js/vm.js";

import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";


function generatorPolyTest(n, expect) {
    var testCode = `call expLogLut; ldi ${n}; call generatorPoly`;
    let ret = assembleTestCode(testCode);
    let vm = new VM({program: ret});
    var state = vm.run();

    let mem = state.mem.slice(556, 556 + n + 1);
    console.log(mem);
    assert.deepEqual(mem, expect);
}

test('generatorPoly(1)', () => {
    generatorPolyTest(1, [1, 1]);
})

test('generatorPoly(2)', () => {
    generatorPolyTest(2, [2, 3, 1]);
})

test('generatorPoly(16)', () => {
    generatorPolyTest(16, [59, 36, 50, 98, 229, 41, 65, 163,  8, 30, 209, 68, 189, 104, 13, 59, 1]);
})
