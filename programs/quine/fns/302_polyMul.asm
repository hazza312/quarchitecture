 # FILE: 302_polyMul.asm #####################################################

polyMul: # ( paddr psize n -- )
 # a simplified version of polynomial multiplication that takes a polynomial and multiplies by (x + n)
 # put n on the side for later
 # note that psize should be total "capacity" of polynomial (not current order)
 tor
 over
 over
 # ( paddr pszie paddr psize )
 # multiplying by 1x, shift each element one spot in the coefficient array
 dec
 tor
l302:
 dup
 rtop
 add
 call shift
 loop l302
 drop

 tos
 swap

 # ( paddr n psize )
 # now that we have shifted one spot, need to do A[i] += A[i+1] * n
 tor
 swap
l302b:
 # ( n paddr )
 over
 over
 call mulElement
 inc
 loop l302b

 drop
 drop
 ret


shift: # ( paddr )
 dup
 dec
 ld
 # ( paddr p[n-1] )
 swap
 st
 ret

mulElement: # ( n paddr -- )
 dup
 inc
 ld
 # ( n paddr A[i+1] )
 rot
 # ( paddr A[i+1] n )
 mul
 # ( paddr A[i+1]*n )
 swap
 # ( A[i+1]*n paddr )
 dup
 ld
 # ( A[i+1]*n paddr A[i])
 rot
 # ( paddr A[i] A[i+1]*n )
 add
 # ( paddr A[i]+A[i+1]*n )
 swap
 # ( A[i]+A[i+1]*n paddr )
 st
 ret