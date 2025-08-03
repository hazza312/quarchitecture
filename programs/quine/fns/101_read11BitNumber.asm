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
