 # FILE: 300_expLogLut.asm ###################################################
 # generate lookup tables as defined in https://dev.to/maxart2501/let-s-develop-a-qr-code-generator-part-iii-error-correction-1kbm

expLogLut:
 ldi 254
 tor
 ldi 1 # initial value
l300:
 call nextValue
 dup
 # get exponent from loop index
 rtop
 call loopIdxToExponent
 call storeValueExponent
 loop l300
 drop
 ret

storeValueExponent: # (value exponent)
 over
 over
 # (v e v e)
 swap
 ldi logLut
 add
 st
 # ( v e )
 ldi expLut
 add
 st
 ret


loopIdxToExponent: # ( n -- n)
 ldi 255
 swap
 sub
 ldi 255
 mod
 ret

nextValue: # ( n -- n )
 ldi 1
 shl
 # if > 255, xor with 285
 dup
 ldi 255
 sub
 m? ret
 ldi 285
 xor
 ret