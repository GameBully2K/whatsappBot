#!/bin/bash

cp index.js /home/ubuntu/.cache/index.js
file="/home/ubuntu/.cache/index.js"

git fetch
git pull

file1="/home/ubuntu/dev/whatsappBot/index.js"

if ! cmp -s "$file" "$file1"; then
	forever restart index.js
fi

rm /home/ubuntu/.cache/index.js
