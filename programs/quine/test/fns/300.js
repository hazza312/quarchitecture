

const LOG = new Uint8Array(256);
const EXP = new Uint8Array(256);
for (let exponent = 1, value = 1; exponent < 256; exponent++) {
    value = value > 127 ? ((value << 1) ^ 285) : value << 1;
    console.log(exponent, value);
    LOG[value] = exponent % 255;
    EXP[exponent % 255] = value;
}


