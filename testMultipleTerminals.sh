#!/bin/bash

# This script opens 4 terminal windows.

i="0"

while [ $i -lt 4 ]
do
open -a Terminal "`pwd`" &
i=$[$i+1]
done
