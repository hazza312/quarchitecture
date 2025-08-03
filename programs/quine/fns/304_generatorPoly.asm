 # FILE: 304_generatorPoly.asm ###############################################

generatorPoly: # ( degree )
 # set initial polynomial 1x^0
 ldi 1
 ldi polyBase
 st

 dec
 tor
l304:
 # paddr
 ldi polyBase

 # psize, TODO check what max size could be
 ldi 32

 # EXP[index]
 rtop
 ldi expLut
 add
 ld

 call gfPolyMul
 loop l304
 ret
