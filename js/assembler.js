class Assembler {
    #LINE_REGEX = /^((\w+):)?\s*(((\w+)\s*\?)?\s*(\w+)(\s+(.+?))?)?\s*(\s+(#.*))?$/;
    #lineNo = 1;
    #pc = 0;
    #constpool = "";
    #touchups=[];
    #equs = new Map();
    #consts = new Map();

    constructor() {
        this.errors = [];
        this.debug = [];
        this.output = [];
        this.labels = new Map();
        this.bin = [];
    }

    assemble(input) {
        for (let line of input.split("\n")) {
            if (line) {
                this.#compileLine(line);
            }
            this.#lineNo++;
        }
        this.#resolveForwardRefs();
        this.bin = [...this.debug.values()].flat().join("") + this.#constpool;
        return this.bin;      
    }

    totalLines() {
        return this.#pc;
    }

    #resolveForwardRefs() {
        for (let unresolved of this.#touchups) {
            let [dstPc, fromLine, dst] = unresolved;  
            let ref = this.#getRef([dst], 0);
            if (ref == null) {
                this.#error(`unresolved forward ref ${dst}`, fromLine);
                continue;
            } 
            
            if (ref.length == 1) ref.push("0");
            this.debug[fromLine][this.debug[fromLine].length - 2] = ref[0];
            this.debug[fromLine][this.debug[fromLine].length - 1] = ref[1];
        }
    }

    #compileLine(line) {
        var match = line.match(this.#LINE_REGEX);
        if (match == null) {
            this.#error('bad syntax');
            return;
        }

        let label = match[2];
        let cnd = match[5];
        let op = match[6];
        let args = match[8]?.split(",").map(x => x.trim()) || [];

        if (label) this.labels.set(label, this.#pc);
        if (cnd) this.#compileCondition(cnd);
        if (op) this.#compileInstruction(op, args);
    }

    #compileCondition(cnd) {
        cnd = this.#expectOneOf(cnd, ['u', 'z', 'nz', 'm', 'p']);
        if (cnd == 'u') return;
        this.#writeOpcode(cnd);
    }

    #branchInstruction(opbase, args, i) {
        var absOffset = this.#getAbsoluteOffset(args, i);
        var offsetEncoded;
        if (absOffset == null) {
            // it's a currently undefined reference (forward). put placeholder & resolve later
            this.#touchups.push([this.#pc+1, this.#lineNo, args[0]]);
            offsetEncoded = encodeNumUnsigned(0, 2);
        } else {
            let relOffsetEncoded = encodeNum(absOffset - this.#pc - 1, true);
            if (opbase == 'loop'/*relOffsetEncoded.length == 1*/) {
                offsetEncoded = relOffsetEncoded;
            } else {
            offsetEncoded = encodeNumUnsigned(absOffset, 2);
            }
        }

        let opkey = opbase + "_" + offsetEncoded.length;
        if (!OPCODE_TO_CHAR.has(opkey)) {
            this.#error(`addressing mode unsupported for ${opkey}`);
        }

        this.#write(OPCODE_TO_CHAR.get(opbase + "_" + offsetEncoded.length));
        offsetEncoded.forEach(x => this.#write(x));
    }

    #compileInstruction(op, args) {
        args = args || [];
        if (["jmp", "loop", "call"].includes(op)) {
            this.#expectArgs(op, args, 1);
            this.#branchInstruction(op, args, 0);

        } else if (op == "ldi") {
            let dst = this.#getAbsoluteOffset(args, 0);
            if (dst == null) {
                this.#branchInstruction(op, args, 0);
            } else {
                let encoded = this.#encodeOrDefault(dst, 3, true, 0);
                this.#writeOpcode("ldi_" + encoded.length);
                encoded.forEach(x => this.#write(x));
            }

        } else if (op == "sys") {
            var val = SYS_CALLS.get(args[0]);
            val = val === undefined ? this.#expectInt(op, args, 0) : val;

            this.#writeOpcode(op);
            this.#write(this.#encodeOrDefault(val, 1, false, 0));

        } else if (["ldz", "stz"].includes(op)) {
            let val = this.#expectInt(op, args, 0);
            this.#writeOpcode(op);
            this.#write(this.#encodeOrDefault(val, 1, false, 0));

        } else if (OPCODE_TO_CHAR.has(op)) {
            this.#expectArgs(op, args, 0);
            this.#writeOpcode(op);

        } else if(op == "res") {
            for (let i = 0; i < this.#expectInt(op, args, 0); i++)
                this.#compileInstruction("nop");

        } else if (op == "equ") {
            let name = args[0];
            let val = this.#expectInt("equ", args, 1);
            if (this.#equs.has(name)) {
                this.#error(`equ ${name} is already defined`);
                return;
            }

            this.#equs.set(name, val);
        } else if (op == "const") {
            let name = args[0];
            let rest = args.slice(1);
            let vals = rest
                .map((e, i) => this.#expectInt("const", rest, i))
                .map(n => encodeNumFixed(n, 2, true))
                .flat()
                .join("");

            if (this.#consts.has(name)) {
                this.#error(`const ${name} is already defined`);
                return;
            }

            this.#consts.set(name, this.#constpool.length);
            this.#constpool += vals;
        } else {
            this.#error("unknown op: " + op);     
        }
    }

    #writeOpcode(opcode) {
        this.#write(OPCODE_TO_CHAR.get(opcode));
    }

    #write(b) {
        if (!this.debug[this.#lineNo]) {
            this.debug[this.#lineNo] = [];
        }
        this.debug[this.#lineNo].push(b);
        this.#pc++;
        return this.debug[this.#lineNo];
    }

    #error(msg, line) {
        line = line || this.#lineNo;
        if (!this.errors[line]) {
            this.errors[line] = [];
        }

        this.errors[line].push(msg);
    }

    #expectArgs(op, args, len) {
        if (args.length != len) {
            this.#error(`${op} expects ${len} args but got ${args.length}`);
            return false;
        }
        return true;
    }

    #expectInt(op, args, i) {
        let val = parseInt(args[i]);
        if (isNaN(val)) {
            this.#error(`${op} expects arg ${i} to be int`);
            return 0;
        }
        return val;
    }

    #expectOneOf(x, options) {
        if (!options.includes(x)){
            this.#error(`expected one of ${options} but got ${x}`);
            return options[0];
        }
        return x;
    }

    #encodeOrDefault(n, maxChars, signed, orelse) {
        var encoded = encodeNum(n, signed);
        if (encoded.length > maxChars) {
            this.#error(`${n} out of range`);
            return encodeNum(orelse, true);
        }
        return encoded;
    }

    #getAbsoluteOffset(args, i) {
        if (args[i] === undefined) {
            return 0;
        }
        let val = parseInt(args[i]);
        if (!isNaN(val)) {
            return val;
        }
        if (this.labels.has(args[i])) {
            return this.labels.get(args[i]);
        }
        if (this.#equs.has(args[i])) {
            return this.#equs.get(args[i]);
        }

        return null;
    }

    #getRef(args, i) {
        let val = parseInt(args[i]);
        if (!isNaN(val)) {
            return this.#encodeOrDefault(val, 2, true, 0);
        }
        if (this.labels.has(args[i])) {
            return this.#encodeOrDefault(this.labels.get(args[i]), 2, true, 0);
        }
        if (this.#consts.has(args[i])) {
            return this.#encodeOrDefault(this.#consts.get(args[i]) + this.#pc, 2, false, 0);
        }

        return null;
    }
    
}