 # FILE: 307_findDegree.asm ###############################################
 # finds the degree of a polynomial

findDegree: # ( poly size -- d )
 dec                        # base size-1
 tor
 dup                        # base base
 rtop
 add                        # base ptr
l307:                       # base ptr
 dup                        # base ptr ptr
 ld                         # base ptr val
 nz? jmp l307earlyreturn    # base ptr
 dec                        # base ptr-1
 loop l307
 sub
 dec
 # 0
 # TODO maybe would be useful to return -1 instead
 ret

l307earlyreturn:
 tos
 drop
 sub
 neg
 # n
 ret