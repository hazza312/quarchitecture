import {VM} from "../../../../js/vm.js";
import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";

function assertStack(data, expect) {
    let testCode = `
ldi endProgMemory
call read11BitNumber
`
    let bin = assembleTestCode(testCode) + data;
    let actual = new VM({program: bin}).run().stack;
    assert.deepEqual(actual, [expect]);
}

test('simple 1', () => {
    assertStack("AC", 462);
})

test('simple 2', () => {
    assertStack("-4", 1849);
})


