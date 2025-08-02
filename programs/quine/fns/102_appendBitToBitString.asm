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
