 # FILE: 306_copyBufReverse.asm ###############################################
 # copies buffer from a => b while reversing it

copyBufReverse: # ( src dst size -- )
 dec
 tor
 rtop
 add

l306:
 # A B
 over
 # A B A
 ld
 # A B Ad
 over
 # A B Ad B
 st
 # A B
 dec
 # A B-1
 swap
 # B-1 A
 inc
 # B-1 A+1
 swap
 # A+1 B-1
 loop l306
 ret
