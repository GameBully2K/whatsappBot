#!/bin/bash
cp /home/ubuntu/dev/whatsappBot/index.js /home/ubuntu/.cache/indexcp.js

copy=/home/ubuntu/.cache/indexcp.js
cd /home/ubuntu/dev/whatsappBot
git fetch
git pull
file=/home/ubuntu/dev/whatsappBot/index.js

if ! cmp -s "$file" "$copy"; then
	reboot
fi

rm /home/ubuntu/.cache/indexcp.js
