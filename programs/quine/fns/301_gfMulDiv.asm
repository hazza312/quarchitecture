 # FILE: 301_gfMulDiv.asm ####################################################
gfMul: # ( a b -- n )
 over
 over
 and
 z? jmp 301mulreturn0
 # LOG[b]
 ldi logLut
 add
 ld
 # LOG[a]
 ldi logLut
 add
 ld
 # LOG[a] + LOG[b]
 add
 # (LOG[a] + LOG[b]) % 255
 ldi 255
 mod
 # EXP[(LOG[a] + LOG[b]) % 255]
 ldi expLut
 add
 ld
 ret

301mulreturn0:
 and
 ret

gfDiv: # ( a b -- n )
 # LOG[b]
 ldi logLut
 add
 ld
 # LOG[b] * 254
 ldi 254
 mul
 swap
 # LOG[a]
 ldi logLut
 add
 ld
 # LOG[a] + LOG[b] * 254
 add
 # (LOG[a] + LOG[b] * 254) % 255
 ldi 255
 mod
 # EXP[(LOG[a] + LOG[b] * 254) % 255]
 ldi expLut
 add
 ld
 ret
