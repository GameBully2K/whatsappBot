#!/bin/bash
cp index.js /home/ubuntu/.cache/indexcp.js

copy=/home/ubuntu/.cache/indexcp.js
git fetch
git pull
file=index.js

if ! cmp -s "$file" "$copy"; then
    killall node
	sleep 5
	node index.js &
fi

rm /home/ubuntu/.cache/indexcp.js
