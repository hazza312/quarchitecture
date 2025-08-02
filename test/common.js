import { VM } from '../js/vm.js';
import { Assembler } from "../js/assembler.js";
import test from 'node:test';
import assert from "assert";
import {encodeNum2, getLimit} from "../js/common.js";


function compile(program) {
    let asm = new Assembler();
    let bin = asm.assemble(program.replaceAll(';', "\n"));
    console.log(`program ${program} compiled to ${bin}`);
    assert.deepEqual(asm.errors, []);
    return bin;
}

function run(program, numSteps) {
    let outBuf = []
    let vm = new VM({
        program: compile(program),
        sys: {
            inChar: () => "h",
            outChar: c => outBuf.push(c),
            outNum: n => outBuf.push(n),
            drawDot: (x, y) => outBuf.push([x, y]),
            randInt: n => Math.floor(Math.random() * n),
            dmp: s => console.log(s),
            brk: () => {throw new Error("VM brkpoint"); }
        }
    });
    for (let i = 0; i < numSteps; i++) vm.step();
    return {...vm.state, out: outBuf };
}


test('getLimitEven', () => {
    assert.deepEqual(getLimit(2, 8), [-128, 127, 0, 255])
})
// -4 -3 -2 -1 0 1 2 3 4
test('getLimitOdd', () => {
    assert.deepEqual(getLimit(3, 2), [-4, 4, 0, 8])
})

test('encodeNum2', () => {
    assert.deepEqual(encodeNum2(2, 2), [-4, 4, 0, 8])
})

