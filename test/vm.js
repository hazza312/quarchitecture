import { VM } from '../js/vm.js';
import { Assembler } from "../js/assembler.js";
import test from 'node:test';
import assert from "assert";


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

function assertStack(program, numSteps, expectStack) {
    assert.deepEqual(run(program, numSteps).stack, expectStack );
}

test('nop', (t) => {
    assertStack('nop', 1, []);
})

test('ldi 1', (t) => {
    assertStack('ldi 0', 1, [0]);
})

test('ldi 2', (t) => {
    assertStack('ldi 45', 1, [45]);
})

test('ldi 3', (t) => {
    assertStack('ldi 45', 1, [45]);
})

test('inc', (t) => {
    assertStack('ldi 0; inc', 2, [1]);
})

test('dec', (t) => {
    assertStack('ldi 2; dec', 2, [1]);
})

test('neg', (t) => {
    assertStack('ldi 1; neg', 2, [-1]);
})

test('add', (t) => {
    assertStack('ldi 1; dup; add', 3, [2]);
})

test('sub', (t) => {
    assertStack('ldi 3; ldi 1; sub', 3, [2]);
})

test('mul', (t) => {
    assertStack('ldi 3; ldi 2; mul', 3, [6]);
})

test('div', (t) => {
    assertStack('ldi 33; ldi 11; div', 3, [3]);
})

test('mod', (t) => {
    assertStack('ldi 30; ldi 11; mod', 3, [8]);
})

test('not', (t) => {
    assertStack('ldi 4; not', 2, [-5]);
})

test('shl', (t) => {
    assertStack('ldi 4; ldi 1; shl', 3, [2]);
})

test('shr', (t) => {
    assertStack('ldi 4; ldi 1; shr', 3, [8]);
})

test('xor', (t) => {
    assertStack('ldi 1; ldi 3; xor', 3, [2]);
})

test('or', (t) => {
    assertStack('ldi 1; ldi 2; or', 3, [3]);
})

test('and', (t) => {
    assertStack('ldi 2; ldi 3; and', 3, [2]);
})

test('z ? t', (t) => {
    assertStack('ldi 1; z ? ldi 0; ldi 1', 3, [1]);
})

test('z ? f', (t) => {
    assertStack('ldi 0; z ? ldi 0; ldi 1', 3, [0]);
})

test('nz ? t', (t) => {
    assertStack('ldi 1; nz ? ldi 0; ldi 1', 3, [0]);
})

test('nz ? f', (t) => {
    assertStack('ldi 0; nz ? ldi 0; ldi 1', 3, [1]);
})

test('m ? t', (t) => {
    assertStack('ldi -1; m ? ldi 0; ldi 1', 3, [0]);
})

test('m ? f', (t) => {
    assertStack('ldi 0; m ? ldi 0; ldi 1', 3, [1]);
})

test('p ? t', (t) => {
    assertStack('ldi 1; p ? ldi 0; ldi 1', 3, [0]);
})

test('p ? f', (t) => {
    assertStack('ldi 0; p ? ldi 0; ldi 1', 3, [1]);
})

test('call', t => {
    let state = run('call 10', 1);
    assert.partialDeepStrictEqual(state, {rstack: [3], pc: 10})
})

test('jmp', t => {
    let state = run('jmp 10', 1);
    assert.partialDeepStrictEqual(state, {rstack: [], pc: 10})
})

test('jmp rel', t => {
    let state = run('h: nop; jmp h', 2);
    assert.partialDeepStrictEqual(state, {rstack: [], pc: 0})
})

test('ret', t => {
    let state = run('call h; ldi 1;h: ret', 3);
    assert.partialDeepStrictEqual(state, {stack: [1], rstack: [], pc: 5})
})

test('loop', t => {
    let state = run('ldi 3; tor;l: rtop; loop l', 10);
    assert.partialDeepStrictEqual(state, {stack: [3, 2, 1, 0], rstack: [], pc: 6})
})

test('ldi', t => {
    assertStack('ldi 1', 1, [1])
})

test('ldi', t => {
    assertStack('ldi 44', 1, [44])
})

test('ldi', t => {
    assertStack(`ldi 1935`, 1, [1935])
})

test('ldi max', t => {
    let max = Math.floor(Math.pow(45, 3) / 2 - 1);
    assertStack(`ldi ${max}`, 1, [max])
})

test('ldi min', t => {
    let min = -Math.floor(Math.pow(45, 3) / 2 - 1);
    assertStack(`ldi ${min}`, 1, [min])
})

test('ld', t => {
    let state = run('ldi 0; ld', 2);
    assert.partialDeepStrictEqual(state, {stack: [0], pc: 3})
})

test('st', t => {
    let state = run('ldi 1; ldi 0; st', 3);
    assert.partialDeepStrictEqual(state, {stack: [], mem: [1], pc: 5})
})

test('ldz', t => {
    let state = run('ldi 1; stz 0; ldz 0', 3);
    assert.partialDeepStrictEqual(state, {stack: [1], mem: [1], pc: 6})
})

test('stz', t => {
    let state = run('ldi 1; stz 0', 2);
    assert.partialDeepStrictEqual(state, {stack: [], mem: [1], pc: 4})
})

test('ldp', t => {
    assertStack('const x,1; ldi x; ldp', 4, [1]);
})

test('dup', t => {
    assertStack('ldi 1; dup', 2, [1, 1]);
})

test('drop', t => {
    assertStack('ldi 1; drop', 2, []);
})

test('over', t => {
    assertStack('ldi 1; ldi 2; over', 3, [1, 2, 1]);
})

test('swap', t => {
    assertStack('ldi 1; ldi 2; swap', 3, [2, 1]);
})

// test('nip', t => {
//     assertStack('ldi 1; ldi 2; nip', 3, [2]);
// })

test('rot', t => {
    assertStack('ldi 1; ldi 2; ldi 3; rot', 4, [2, 3, 1]);
})

test('rtop', t => {
    let state = run('ldi 1; tor; rtop', 3);
    assert.partialDeepStrictEqual(state, {stack: [1], pc: 4})
})

test('tor', t => {
    let state = run('ldi 1; tor', 2);
    assert.partialDeepStrictEqual(state, {stack: [], rstack: [1], pc: 3})
})

test('nop', t => {
    let state = run('nop', 1);
    assert.partialDeepStrictEqual(state, {stack: [], rstack: [], pc: 1})
})

test('hlt', t => {
    let state = run('hlt', 1);
    assert.partialDeepStrictEqual(state, {hlt: true})
})

test('sys INCHAR', t => {
    assertStack('sys INCHAR', 1, [104, 1]);
})

test('sys OUTCHAR', t => {
    let state = run('sys INCHAR; drop; sys OUTCHAR', 3);
    assert.partialDeepStrictEqual(state, {out: ['h']})
})

test('sys OUTNUM', t => {
    let state = run('ldi 10; sys OUTNUM', 2);
    assert.partialDeepStrictEqual(state, {stack: [], out: [10]})
})

test('sys DRAWDOT', t => {
    let state = run('ldi 1; dup; sys DRAWDOT', 3);
    assert.partialDeepStrictEqual(state, {stack:[], out: [ [1,1] ]})
})

test('sys RANDINT', t => {
    let state = run('ldi 0; sys RANDINT', 2);
    assert.partialDeepStrictEqual(state, {stack:[0]})
})

test('sys DMP', t => {
    let state = run('sys DMP', 1);
    assert.partialDeepStrictEqual(state, {stack:[]})
})

test('sys BRK', t => {
    assert.throws(() => run('sys BRK', 1));
})
