import {VM} from "../../../../js/vm.js";

import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";


function findDegreeTest(input, expect) {
    var testCode = '';
    let A = 1000, Astart = 1000;
    for (let n of input) {
        testCode += `ldi ${n}; ldi ${A}; st; `;
        A++;
    }
    testCode += `ldi ${Astart}; ldi ${input.length}; call findDegree;`;

    let ret = assembleTestCode(testCode);
    let vm = new VM({program: ret});
    let stack = vm.run().stack;
    assert.deepEqual(stack, [expect]);
}

test('findDegreeTest 1', () => {
    findDegreeTest([1, 2, 3, 4, 5, 0, 0, 0], 4);
})

test('findDegreeTest 2', () => {
    findDegreeTest([1, 2], 1);
})

test('findDegreeTest 3', () => {
    findDegreeTest([1], 0);
})

test('findDegreeTest 3', () => {
    findDegreeTest([0], 0);
})

test('findDegreeTest 4', () => {
    findDegreeTest([0, 0, 0], 0);
})
