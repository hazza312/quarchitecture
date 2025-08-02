 # FILE: 000_GLOBALS.ASM #####################################################

 # memory address layout
 # global z variables
equ zPageVariables, 0
equ zvCurrByte, 0
equ zvCurrBit, 1
equ zvQrDataStart, 2
equ zvQrDataSize, 3

equ logLut, 44
equ expLut, 300
equ byteBufferStart, 1000

 # initialise variables
ldi byteBufferStart
stz zvCurrByte

ldi 0
stz zvCurrBit

ldi 0
stz zvQrDataStart

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

dummyData:
 shr
 or
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
 ldi 1 # value
l300:
 ldi 1
 shl
 # if > 255, xor with 285
 dup
 ldi 255
 sub
 m? jmp _300continue
 ldi 285
 xor
_300continue:
 dup

 # have value

 sys OUTNUM

 loop l300
 # FILE: 999_endProgMemory.asm ###############################################
 # DEFINES:
 #   LABEL endProgMemory the end of program memory

endProgMemory:
