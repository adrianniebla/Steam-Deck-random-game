#!/usr/bin/env bash
# Builds the plugin and copies it to the Steam Deck over SSH.
# Usage: ./deploy.sh [deck-host]   (default: deck@steamdeck.local)
pnpm run build

set -euo pipefail

DECK="${1:-deck@steamdeck.local}"
NAME="random-game"
STAGE="/tmp/$NAME"

pnpm run build

ssh "$DECK" "rm -rf $STAGE && mkdir -p $STAGE"
scp -r dist package.json plugin.json main.py LICENSE "$DECK:$STAGE/"
ssh -t "$DECK" "sudo rm -rf ~/homebrew/plugins/$NAME && sudo mv $STAGE ~/homebrew/plugins/$NAME && sudo systemctl restart plugin_loader"

echo "Deployed $NAME to $DECK"
