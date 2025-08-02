// TODO: extract VM logic from vm.html here

import {ARG_LENGTH, CHAR_TO_OPCODE, decodeNum} from './common.js';

export class VM {
    constructor({
        program = [],
        sys = {
            inChar: t => { throw new Error("Syscall inchar undefined"); },
            outChar: t => { throw new Error("Syscall outchar undefined"); },
            outNum: t => { throw new Error("Syscall outnum undefined"); },
            drawDot: t => { throw new Error("Syscall drawDot undefined"); },
            randInt: n => Math.floor(Math.random() * n),
            dmp: () => console.log(this.state),
            brk: () => { throw new Error("VM brkpoint"); }
                }}) {
        this.pc = 0;
        this.stack = [];
        this.rstack = [];
        this.hlt = false;
        this.program = program;
        this.mem = [];
        this.sys = sys;
    }

    #fetch(i) {
        let ret = this.program[i];
        if (ret === undefined) {
            throw new Error(`read ${i} from undefined program memory`);
        }
        return ret;
    }

    #push(n, stack) {
        (stack || this.stack).push(n);
    }

    #pop(stack) {
        if ((stack || this.stack).length == 0) {
            throw new Error(`stack underflow`);
        }
        return (stack || this.stack).pop();
    }

    #peek(stack) {
        if (stack === undefined) stack = this.stack;
        if (stack.length == 0) {
            throw new Error(`stack underflow`);
        }
        return stack[stack.length - 1];
    }


    #arg(len, signed) {
        let parts = this.program.slice(this.pc, this.pc + len).split("");
        this.pc += len;
        return decodeNum(parts, signed);
    }

    #biOp(fn) {
        let b = this.#pop();
        let a = this.#pop();
        this.#push(fn(a, b))
    }

    #condition(cnd) {
        if (!cnd) {
            this.pc += (ARG_LENGTH.get(CHAR_TO_OPCODE.get(this.#fetch(this.pc))) || 0) + 1;
        }
    }

    #call(cnd, len, relative) {
        if (cnd) {
            let callArg = this.#arg(len, relative);
            let dst = relative ? this.pc + callArg - 1: callArg;
            this.#push(this.pc, this.rstack);
            this.pc = dst;
        }
    }

    #jmp(cnd, len, relative) {
        if (cnd) {
            let dst = this.#arg(len, relative);
            this.pc = relative ? this.pc + dst - 1: dst;
        }
    }

    #pm(src, len, signed) {
        return decodeNum(this.program.slice(src, src+len).split(""), true);
    }

    #loop(len, relative) {
        let val = this.#peek(this.rstack);
        if (val <= 0) {
            this.#pop(this.rstack);
            this.pc++;
        } else {
            this.rstack[this.rstack.length - 1]--;
            this.#jmp(true, len, relative);
        }
    }

    step() {
        if (this.hlt)
            return;

        var opChar = this.#fetch(this.pc++);
        if (!CHAR_TO_OPCODE.has(opChar)) {
            throw new Error(`${opChar} not a valid opcode`);
        }

        let op = CHAR_TO_OPCODE.get(opChar);
        // console.log(state.pc-1, opChar, op);
        switch (op) {
            // arithmetic
            case "inc":
                this.#push(this.#pop() + 1);
                break;
            case "dec":
                this.#push(this.#pop() - 1);
                break;
            case "neg":
                this.#push(-this.#pop());
                break;
            case "add":
                this.#biOp((a, b) => a + b);
                break;
            case "sub":
                this.#biOp((a, b) => a - b);
                break;
            case "mul":
                this.#biOp((a, b) => a * b);
                break;
            case "div":
                this.#biOp((a, b) => Math.floor(a / b));
                break;
            case "mod":
                this.#biOp((a, b) => Math.floor(a % b));
                break;

            // bitwise
            case "not":
                this.#push(~this.#pop());
                break;
            case "shl":
                this.#biOp((a, b) => a >> b);
                break;
            case "shr":
                this.#biOp((a, b) => a << b);
                break;
            case "xor":
                this.#push(this.#pop() ^ this.#pop());
                break;
            case "or":
                this.#push(this.#pop() | this.#pop());
                break;
            case "and":
                this.#push(this.#pop() & this.#pop());
                break;

            // conditions
            case "nz":
                this.#condition(this.#pop() != 0);
                break;
            case "z":
                this.#condition(this.#pop() == 0);
                break;
            case "m":
                this.#condition(this.#pop() < 0);
                break;
            case "p":
                this.#condition(this.#pop() > 0);
                break;

            // control flow
            case "ret":
                this.pc = this.#pop(this.rstack);
                break;
            case "jmp_1":
                this.#jmp(true, 1, true);
                break;
            case "jmp_2":
                this.#jmp(true, 2, false);
                break;
            case "call_1":
                this.#call(true, 1, true);
                break;
            case "call_2":
                this.#call(true, 2, false);
                break;
            case "loop_1":
                this.#loop(1, true);
                break;

            // load/store
            case "ldi_1":
                this.#push(this.#arg(1, true));
                break;
            case "ldi_2":
                this.#push(this.#arg(2, true));
                break;
            case "ldi_3":
                this.#push(this.#arg(3, true));
                break;
            case "ld":
                this.#push(this.mem[this.#pop()] || 0);
                break;
            case "st":
                this.mem[this.#pop()] = this.#pop();
                break;
            case "ldz":
                this.#push(this.mem[this.#arg(1, false)] || 0);
                break;
            case "stz":
                this.mem[this.#arg(1, false)] = this.#pop();
                break;
            case "ldp":
                this.#push(this.#pm(this.#pop(), 2, true));
                break;

            // stack
            case "dup": {
                let a = this.#pop();
                this.#push(a);
                this.#push(a);
                break;
            }
            case "drop":
                this.#pop();
                break;
            case "over": {
                let a = this.#pop();
                let b = this.#pop();
                this.#push(b);
                this.#push(a);
                this.#push(b);
                break;
            }
                ;
            case "swap": {
                let a = this.#pop();
                let b = this.#pop();
                this.#push(a);
                this.#push(b);
                break;
            }
            case "rtop":
                this.#push(this.#peek(this.rstack));
                break;
            case "tos":
                this.#push(this.#pop(this.rstack));
                break;
            case "tor":
                this.#push(this.#pop(), this.rstack);
                break;
            case "rot": {
                let c = this.#pop();
                let b = this.#pop();
                let a = this.#pop();
                this.#push(b);
                this.#push(c);
                this.#push(a);
                break;
            }

            case "nop":
                break;
            case "hlt":
                this.hlt = true;
                break;
            case "sys":
                this.#doSys(this.#arg(1, false));
                break;
            default:
                throw new Error(`unknown opcode ${op}`);
        }
    }

    #doSys(cmd) {
        switch(cmd) {
            case 0: {
                try {
                    this.#push(this.sys.inChar().charCodeAt(0));
                    this.#push(1);
                } catch (Error) {
                    this.#push(0);
                    this.#push(0);
                }
                break;
            }
            case 1: {
                this.sys.outChar(String.fromCharCode([this.#pop()]));
                break;
            }
            case 2: {
                this.sys.outNum(this.#pop());
                break;
            }
            case 3: { // draw dot (x y 3 -- )
                let y = this.#pop();
                let x = this.#pop();
                this.sys.drawDot(x, y);
                break;
            }
            case 4: break;
            case 5: { // random number (n -- n)
                this.#push(this.sys.randInt(this.#pop()));
                break;
            }
            case 42: {
                this.sys.dmp();
                break;
            }
            case 43: {
                this.sys.brk();
                break;
            }
        }
    }
    get state() {
        return {
            pc: this.pc,
            stack: this.stack,
            rstack: this.rstack,
            hlt: this.hlt,
            mem: this.mem
        }
    }
}
