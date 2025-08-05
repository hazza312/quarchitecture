# FILE: 308_polyDiv.asm ###############################################
# does polynomial division
# translated from this C prototype (probably has bugs)

# int p[] = {4, 5, 8, 28}; // 1 + 2x + 3x^2
# int d[] = {2, 7, 2}; // 1 + x

# int pHighestPower = sizeof(p)/sizeof(int) - 1;
# int dLeadingPower = sizeof(d)/sizeof(int) - 1;

# for (int pLeadingPower = pHighestPower; pLeadingPower >= dLeadingPower; pLeadingPower--) {
#    int q = p[pLeadingPower] / d[dLeadingPower];

#     for (int pi = pLeadingPower, di = dLeadingPower; di >= 0; di--, pi--) {
#         p[pi] = p[pi] - q * d[di];
#     }
# }

# return 0;

# some working variables
equ zvDividend, 22
equ zvDivisor, 23
equ zvDivisorOrder, 24

polyDiv: # ( p pSize d2 dSize )
 # let's do away with size and find the leading powers of each
 over
 swap                       # p pSize d d dSize
 call findDegree            # p pSize d dOrder
                            # put divisor away for now
 stz zvDivisorOrder         # p pSize d
 stz zvDivisor              # p pSize

 over                       # p pSize p
 swap                       # p p pSize
 call findDegree            # p pDegree
 tor                        # p     R: pDegree
 stz zvDividend             # --    R: pDegree

l308outer:
 rtop                       # plp
 call l308outerbody         # --
 rtop                       # plp
 ldz zvDivisorOrder         # plp dorder
 sub                        # plp-dorder
 z? jmp l308earlydone       # --
 loop l308outer             # --
 ret

l308earlydone:
 tos
 drop
 ret

l308outerbody: # ( pLeadingPower -- )
 # q = p[pLeadingPower] / d[dLeadingPower]
 dup                        # plp plp
 ldz zvDividend             # plp plp p
 add                        # plp &p[plp]
 ld                         # plp p[plp]

 ldz zvDivisor              # plp p[plp] d
 ldz zvDivisorOrder         # plp p[plp] d dlp
 add                        # plp p[plp] &d[dlp]
 ld                         # plp p[plp] d[dlp]
 div                        # plp q

 ldz zvDivisorOrder         # plp q dlp
 tor                        # pi q R: di
l308inner:
 # iterate decrementing pi and di,
 # do p[pi] -= q*d[di], p[pi-1] -= q*d[di-1], ...
 over                       # pi q pi
 over                       # pi q pi q
 rtop                       # pi q pi q di
 call l308innerbody         # pi q
 swap                       # q pi
 dec                        # q pi-1
 swap                       # pi-1 q
 loop l308inner
 drop                       # pi-1
 drop                       # --
 ret


l308innerbody: # ( pi q di -- )
 # performs a single p[pi] = p[pi] - q * d[di];
 ldz zvDivisor              # pi q di d
 add                        # pi q di &d[di]
 ld                         # pi q d[di]
 mul                        # pi q*d[di]
 swap                       # q*d[di] pi
 ldz zvDividend             # q*d[di] pi p
 add                        # q*d[di] &pi[p]
 dup                        # q*d[di] &pi[p] &pi[p]
 ld                         # q*d[di] &pi[p] pi[p]
 rot                        # &pi[p] pi[p] q*d[di]
 sub                        # &pi[p] pi[p]-q*d[di]
 swap                       # pi[p]-q*d[di] &pi[p]
 st                         # --
 ret

