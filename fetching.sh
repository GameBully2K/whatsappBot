#!/bin/bash
cp index.js /home/ubuntu/.cache/indexcp.js

copy=/home/ubuntu/.cache/indexcp.js
git fetch
git pull
file=index.js

if ! cmp -s "$file" "$copy"; then
	
fi

rm /home/ubuntu/.cache/indexcp.js
