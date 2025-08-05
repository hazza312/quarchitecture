import {VM} from "../../../../js/vm.js";

import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";


function polyDivTest(dividend, divisor, expect) {
    var testCode = '';
    let A = 1000, Astart = 1000;
    for (let n of dividend) {
        testCode += `ldi ${n}; ldi ${A}; st; `;
        A++;
    }
    let B = 2000, Bstart = 2000;
    for (let n of divisor) {
        testCode += `ldi ${n}; ldi ${B}; st; `;
        B++;
    }
    testCode += `ldi ${Astart}; ldi ${dividend.length}; ldi ${Bstart}; ldi ${divisor.length}; call polyDiv;`;

    let ret = assembleTestCode(testCode);
    let vm = new VM({program: ret});
    let remainder = vm.run().mem.slice(Astart, Astart + expect.length);
    assert.deepEqual(remainder, expect);
}

test('polyDiv 1', () => {
    polyDivTest([1, 2, 1], [1, 1], [0, 0, 0]);
})

test('polyDiv 2', () => {
    polyDivTest([1, 3, 1], [1, 1], [-1, 0, 0]);
})

test('polyDiv 3', () => {
    polyDivTest([-5, 13, -3, 2], [5, 1], [-395, 0, 0]);
})

