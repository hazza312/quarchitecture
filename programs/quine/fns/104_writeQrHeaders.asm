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
