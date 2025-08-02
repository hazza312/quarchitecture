import fs from "fs";
import assert from "assert";
import {Assembler} from "../../../../js/assembler.js";

export function assembleTestCode(testCode) {
    let progCode = fs.globSync('programs/quine/fns/*.asm')
        .map(path => fs.readFileSync(path, {encoding: 'utf8'}))
        .join("\n")
        .replace(" # THIS IS A PLACEHOLDER FOR MAIN APPLICATION", testCode + "\nhlt\n");

    console.log('hello', progCode);
    let asm = new Assembler();
    asm.assemble(progCode);
    assert.deepEqual(asm.errors, []);
    return asm.bin;
}

