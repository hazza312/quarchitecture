import {VM} from "../../../../js/vm.js";

import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";


function copyBufReverse(input) {
    var testCode = '';
    let A = 1000, Astart = 1000;
    for (let n of input) {
        testCode += `ldi ${n}; ldi ${A}; st; `;
        A++;
    }
    let Bstart = 2000;
    testCode += `ldi ${Astart}; ldi ${Bstart}; ldi ${input.length}; call copyBufReverse;`;

    let ret = assembleTestCode(testCode);
    let vm = new VM({program: ret});
    var state = vm.run();

    let mem = state.mem.slice(Bstart, Bstart + input.length);
    console.log(mem);
    assert.deepEqual(mem, input.reverse());
}

test('copyBufReverse 1', () => {
    copyBufReverse([1]);
})

test('copyBufReverse 2', () => {
    copyBufReverse([1,2,3]);
})

