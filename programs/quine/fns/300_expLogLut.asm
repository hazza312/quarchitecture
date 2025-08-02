 # FILE: 300_expLogLut.asm ###################################################
 # generate lookup tables as defined in https://dev.to/maxart2501/let-s-develop-a-qr-code-generator-part-iii-error-correction-1kbm

expLogLut:
 ldi 254
 tor
 ldi 1 # value
l300:
 ldi 1
 shl
 # if > 255, xor with 285
 dup
 ldi 255
 sub
 m? jmp _300continue
 ldi 285
 xor
_300continue:
 dup

 # have value

 sys OUTNUM

 loop l300