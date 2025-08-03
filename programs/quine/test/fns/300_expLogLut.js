import {VM} from "../../../../js/vm.js";

import test from 'node:test';
import assert from "assert";
import {assembleTestCode} from "./common.js";


test('should populate LOG lut correctly', () => {
    let ret = assembleTestCode("call expLogLut");
    let state = new VM({program: ret}).run();

    const LOG = [];
    for (let exponent = 1, value = 1; exponent < 256; exponent++) {
        value = value > 127 ? ((value << 1) ^ 285) : value << 1;
        LOG[value] = exponent % 255;
    }

    let logLut = state.mem.slice(44, 44 + 256);
    assert.deepEqual(logLut, LOG);
})

test('should populate EXP lut correctly', () => {
    let ret = assembleTestCode("call expLogLut");
    let state = new VM({program: ret}).run();

    const EXP = [];
    for (let exponent = 1, value = 1; exponent < 256; exponent++) {
        value = value > 127 ? ((value << 1) ^ 285) : value << 1;
        EXP[exponent % 255] = value;
    }

    // adapted example from P. 27
    let expLut = state.mem.slice(300, 300 + 256);
    assert.deepEqual(expLut, EXP);
})

