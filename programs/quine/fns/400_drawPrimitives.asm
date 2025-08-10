# FILE: 400_drawPrimitives.asm ####################################################

equ x,22
equ y,23
equ size,24


ldi 0
ldi 0
call drawFinder


ldi 89
ldi 0
call drawFinder

ldi 0
ldi 89
call drawFinder

call alignmentGrid
hlt

alignmentGrid:
 ldi 15
 tor
lxy:
 jmp check
ok:
 rtop
 call alignmentGridInner
ctd:
 loop lxy
 ret


check:
 rtop
 ldi 12
 sub
 z? jmp ctd
 rtop
 ldi 0
 sub
 z? jmp ctd
 rtop
 ldi 3
 sub
 z? jmp ctd
 jmp ok

alignmentGridInner:
 dup
 ldi 4
 div
 ldi 28
 mul
 ldi 4
 add

 swap
 ldi 4
 mod
 ldi 28
 mul
 ldi 4
 add
 sys DMP
 call drawAlignment
 ret


drawAlignment: # ( x y -- )
 over
 over
 ldi 5
 call square
 call add2
 sys DRAWDOT
 ret

drawFinder: # ( x y -- )
 over
 over
 ldi 7
 call square

 call add2
 over
 over
 ldi 3
 call square

 inc
 swap
 inc
 swap
 sys DRAWDOT
 ret

add2: # (x y --)
 ldi 2
 add
 swap
 ldi 2
 add
 swap
 ret

square: # (x y size --)
 dec
 stz size
 stz y
 stz x

 ldz size
 tor
l:
 rtop
 call inner
 loop l
 ret

inner:
 tor

 ldz x
 rtop
 add
 ldz y

 ldz x
 ldz y
 rtop
 add

 ldz x
 ldz size
 add
 ldz y
 rtop
 add

 ldz x
 rtop
 add
 ldz y
 ldz size
 add


 ldi 3
 tor
l5:
 sys DRAWDOT
 loop l5

 tos
 drop
 ret