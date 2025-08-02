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
