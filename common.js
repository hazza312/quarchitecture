const GAMUT = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".split("");
const NUM_BASE = GAMUT.length;
const OPCODES = [
    // arith
    "inc",
    "dec",
    "neg",
    "add",
    "sub",
    "mul",
    "div",
    "mod",

    // bit
    "not",
    "shl",
    "shr",
    "xor",
    "or",
    "and",

    // cnd,
    "z",
    "nz",
    "m",
    "p",

    // ctrl
    "ret",
    "jmp_1",
    "jmp_2",
    "call_1",
    "call_2",
    "loop_1",

    // load/store
    "ldi_1",
    "ldi_2",
    "ldi_3",
    "ld",
    "st",
    "ldz",
    "stz",
    "ldp",

    // stack
    "dup",
    "drop",
    "over",
    "swap",
    "nip", // bye?
    "rot",
    "rtop",
    "tos",
    "tor",

    // misc
    "nop",
    "hlt", // bye?
    "sys"
]

const OPCODE_TO_CHAR = new Map(Array.of(...OPCODES.entries()).map(([i, v]) => [v, GAMUT[i]]));
const CHAR_TO_OPCODE = new Map(Array.of(...OPCODES.entries()).map(([i, v]) => [GAMUT[i], v]));

const CHAR_TO_IDX = new Map([...GAMUT.entries()].map(([i, v]) => [v, i]));

const ARG_LENGTH = new Map([
    ['jmp_1', 1],
    ['jmp_2', 2],
    ['call_1', 1],
    ['call_2', 2],
    ['ldi_1', 1],
    ['ldi_2', 2],
    ['ldi_3', 3],
    ['ldz', 1],
    ['stz', 1],
    ['ldc', 1],
    ['loop_1', 1]
]);

const SYS_CALLS = new Map([
    ["INCHAR", 0],
    ["OUTCHAR", 1],
    ["OUTNUM", 2],
    ["DRAWDOT", 3],
    ["CLEARDOT", 4],
    ["RANDINT", 5],

    ["DMP", 42],
    ["BRK", 43],
])


function encodeNumUnsigned(n, d) {
    var chars = [];
    for (let i = 0; i < d; i++) {
        chars.push(GAMUT[n % NUM_BASE]);
        n = Math.floor(n / NUM_BASE);
    }

    return chars;
}

/**
 * TODO make less hacky
 */
function encodeNum(n, signed) {
    for (let i = 1; i < 10; i++) {
        let ret = encodeNumFixed(n, i, signed);
        if (ret != null) {
            return ret;
        }
    }

    throw new Error("too big");
}

function encodeNumFixed(n, size, signed) {
    let divisor = signed ? 2 : 1;
    let unsignedLim = Math.pow(NUM_BASE, size);
    let lim = Math.floor(unsignedLim / divisor);

    if (n >= -lim && n < lim) {
        if (n < 0) 
            n = unsignedLim + n - 1;
        return encodeNumUnsigned(n, size);
    }
    return null;
}


function decodeNum(chars, signed) {
    let lim = Math.pow(NUM_BASE, chars.length);
    var n = 0;
    for (let c of chars.reverse()) {
        n *= NUM_BASE;
        n += CHAR_TO_IDX.get(c);
    }

    if (signed && n >= lim/2 - 1) {
        n -= lim - 1;
    }

    return n;
}
console.log(OPCODE_TO_CHAR);
