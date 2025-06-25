#!/bin/bash

function convert_MB() {
  FILE=$(echo $1 | sed -e 's/.*\///')
  BYTE=$(wc -c $1 | awk '{print $1}')
  echo "scale=2; $BYTE / 1024 / 1024" | bc | xargs printf "$FILE: %.2fMB\n"
}

pnpm run build
convert_MB ./workspaces/client/dist/client.global.js
convert_MB ./workspaces/client/dist/serviceworker.global.js
convert_MB ./workspaces/server/dist/server.js
pnpm run start
