 # FILE: 000_GLOBALS.ASM #####################################################

 # memory address layout
 # global z variables
equ zPageVariables, 0
equ zvCurrByte, 0
equ zvCurrBit, 1
equ zvQrDataStart, 2
equ zvQrDataSize, 3
 # lookup tables (populated at runtime)
equ logLut, 44
equ expLut, 300
 # buffers
equ polyBase, 556
equ byteBufferStart, 1000

 # initialise variables
ldi byteBufferStart
stz zvCurrByte

ldi endProgMemory
stz zvQrDataSize

 # FILE: 100_main.asm ########################################################
 # THIS IS A PLACEHOLDER FOR MAIN APPLICATION

 # FILE: 101_read11BitNumber.asm #############################################
 # TODO this could be simplified the two fns together,
 # but kept separate for now to make debugging easier

read11BitNumber: # ( addr -- n )
 # read next 11-bit value (P27)
 call readPmTwoChars
 swap
 ldi 45
 mul 
 add
 ret

readPmTwoChars: #( addr -- c1 c2 )
 # lpm command reads a 2char signed number
 # this reads and interpets as unsigned
 # pushing the two chars (hi lo) on the stack 
 ldp
 dup
 m ? call _correctNum
 dup
 ldi 45
 mod
 swap
 ldi 45
 div
 ret

_correctNum:
  ldi 2024 # 45 * 45 - 1
  add
  ret

 # FILE: 102_appendBitToBitString.asm ########################################
 # DEFINES:
 #   appendBitToBitString( 0/1 -- )
 # USES:
 #   000 zvCurrByte, state initialised to beginning of output buffer
 #   000 zvCurrBit, state initialised to 0, next bit to be written in current byte

appendBitToBitString: # ( 0/1 -- )
 ldz zvCurrBit         # load the current bit
 ldi 8                 # check if we have filled 8 bits
 sub
 z? call _advanceByte  # if so, advance to next byte
 ldz zvCurrByte        # load address of current byte
                       # load the value, shift left 1 bit
 ld
 ldi 1
 shl
                       # append the current bit and store
 or
 ldz zvCurrByte
 st
                       # increment the bit count and store
 ldz zvCurrBit
 inc
 stz zvCurrBit
 ret

_advanceByte:
 ldi 0                 # reset zvCurrBit to 0
 stz zvCurrBit
 ldz zvCurrByte        # increment the byte ptr and store back
 inc
 stz zvCurrByte
 ret

 # FILE: 103_appendBitsToBitString.asm #######################################
appendBitsToBitString: # ( val nBits -- )
 # appends for a single value the bits, left padded
 # place nBits on rstack and iteratively call appendBitToBitString masking
 # for the correct bit

 dec
 tor
l103:
 dup
 rtop
 shr
 ldi 1
 and
 call appendBitToBitString
 loop l103
 drop
 ret

 # FILE: 103_writeQrHeaders.asm ##############################################
 # USES:
 #   000 zvQrDataSize
 #   000 zvQrDataStart
 #   103 appendBitsToBitString

writeQrHeaders: # ( -- )
 # first write the mode indicator
 ldi 2 # mode 0b0010 is alphanumeric mode (P 23)
 ldi 4
 call appendBitsToBitString

 # then add the character count
 # TODO: number of bits is determined by QR "verison"
 #  (https://www.qrcode.com/en/about/version.html)
 # V1-9 => 9 bits
 # V10-26 => 11 bits
 # V27-40 => 13 bits

 ldz zvQrDataSize
 ldi 9
 call appendBitsToBitString

 # then write qr code stream
 # for all the pairs of alphanumeric characters, write them as 11bit values
 # loop dataSize/2 times
 ldz zvQrDataSize
 ldi 2
 div
 dec
 tor
 # start at beginning of data
 ldz zvQrDataStart
l104:
 dup
 call read11BitNumber
 ldi 11
 call appendBitsToBitString
 # move pointer to next pair
 inc
 inc
 loop l104

 # ok, if the data size is odd, we need to pad the last one with 6 bits
 ldz zvQrDataSize
 ldi 1
 and
 z? jmp d103
 call readPmTwoChars
 drop
 ldi 6
 call appendBitsToBitString
 ret

d103:
 drop
 ret

 # FILE: 200_QR_CODE_LOGIC.asm ###############################################
 # Logic here some basic definitions
 # FILE: 201_qrHeaderBitsInCharacterCount.asm ################################

qrHeaderBitsInCharacterCount: # ( -- n)
 # assuming alphanumeric mode, see P23


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
 over           # v e v e
 swap
 ldi logLut
 add
 st             # v e
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
 # FILE: 301_gfMulDiv.asm ####################################################
gfMul: # ( a b -- n )
 dup
 z? jmp f301mulreturn0
 over
 z? jmp f301mulreturn0

 # ( a b )
 # LOG[b]
 ldi logLut
 add
 ld
 swap
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

f301mulreturn0:
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

 # FILE: 306_copyBufReverse.asm ###############################################
 # copies buffer from a => b while reversing it

copyBufReverse: # ( src dst size -- )
 dec
 tor
 rtop
 add

l306:           # A B
 over           # A B A
 ld             # A B Ad
 over           # A B Ad B
 st             # A B
 dec            # A B-1
 swap           # B-1 A
 inc            # B-1 A+1
 swap           # A+1 B-1
 loop l306
 ret

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
# FILE: polyDiv.asm ###############################################
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
 swap               # p pSize d d dSize
 call findDegree    # p pSize d dOrder

                    # put divisor away for now
 stz zvDivisorOrder
 stz zvDivisor

 # p pSize
 over
 swap
 # p p pSize
 call findDegree
 # p pDegree

 tor
 # pHighestPower is the loop counter on the return stack
 stz zvDividend

 # empty param stack, let's party
 sys DMP
l308outer:
 rtop                       # plp
 call l308outerbody         # --
 loop l308outer             # --
 rtop                       # plp
 ldz zvDivisorOrder         # plp dorder
 inc                        # plp dorder+1
 sub                        # plp-dorder+1
 z? jmp l308earlydone
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
 over                       # pi q pi
 swap                       # pi pi q
 rtop                       # pi pi q di
 call l308innerbody         # pi
 dec                        # pi-1
 loop l308inner
 drop
 ret


l308innerbody: # ( pi q di -- )
 ldz zvDivisor      # pi q &d[di]
 ld                 # pi q d[di]
 mul                # pi q*d[di]
 swap               # q*d[di] pi
 ldz zvDividend     # q*d[di] pi p
 add                # q*d[di] &pi[p]
 dup                # q*d[di] &pi[p] &pi[p]
 ld                 # q*d[di] &pi[p] pi[p]
 rot                # &pi[p] pi[p] q*d[di]
 sub                # &pi[p] pi[p]-q*d[di]
 swap               # pi[p]-q*d[di] &pi[p]
 st                 # --
 ret


 # FILE: 999_endProgMemory.asm ###############################################
 # DEFINES:
 #   LABEL endProgMemory the end of program memory

endProgMemory:
