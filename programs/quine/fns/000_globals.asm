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

ldi 0
stz zvCurrBit

ldi 0
stz zvQrDataStart

ldi endProgMemory
stz zvQrDataSize
