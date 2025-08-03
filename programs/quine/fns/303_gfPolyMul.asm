 # FILE: 303_gfPolyMul.asm ###################################################


gfPolyMul: # ( paddr psize n -- )
 # put n on the side for later
 # note that psize should be total "capacity" of polynomial (not current order)
 tor
 over
 over
 # ( paddr pszie paddr psize )
 # multiplying by 1x, shift each element one spot in the coefficient array
 dec
 tor
l303:
 dup
 rtop
 add
 call gfShift
 loop l303
 drop

 tos
 swap

 # ( paddr n psize )
 # now that we have shifted one spot, need to do A[i] += A[i+1] * n
 tor
 swap
l303b:
 # ( n paddr )
 over
 over
 call gfMulElement
 inc
 loop l303b

 drop
 drop
 ret


gfShift: # ( paddr )
 dup
 dec
 ld
 # ( paddr p[n-1] )
 swap
 st
 ret

gfMulElement: # ( n paddr -- )
 dup
 inc
 ld
 # ( n paddr A[i+1] )
 rot
 # ( paddr A[i+1] n )
 call gfMul
 # ( paddr A[i+1]*n )
 swap
 # ( A[i+1]*n paddr )
 dup
 ld
 # ( A[i+1]*n paddr A[i])
 rot
 # ( paddr A[i] A[i+1]*n )
 xor
 # ( paddr A[i]+A[i+1]*n )
 swap
 # ( A[i]+A[i+1]*n paddr )
 st
 ret