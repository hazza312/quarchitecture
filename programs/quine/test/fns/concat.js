import fs from "fs";
let concat = fs.globSync('../../fns/*.asm')
    .map(path => fs.readFileSync(path, {encoding: 'utf8'}))
    .join("\n");

fs.writeFileSync('../../quine.asm', concat);
