#!/bin/bash

set -e

BLACK=`tput sgr0`
RED=`tput setaf 1`
GREEN=`tput setaf 2`

if [ -z "$BOT" ] && [ -z "$BACKGROUND" ]; then
	echo "${RED} You must supply the upgrade version for at least one of the services through environmental variable(s).${BLACK}"
	echo "Example Usage: BOT='1.0.0' BACKGROUND='1.0.0' ./update_code.sh"
	exit 1
fi

echo "Starting Update..."
pushd /code 1>/dev/null

if [ -n "$BOT" ]; then
	VERSION="$BOT"
	echo "Downloading tar file..."
	curl -L "https://github.com/truebluejason/p2e-bot/archive/v${VERSION}.tar.gz" -o p2e-bot.tar.gz 2>/dev/null
	tar -zxf p2e-bot.tar.gz
	rm p2e-bot.tar.gz
	pushd "p2e-bot-${VERSION}" 1>/dev/null
	echo "Running 'npm install'..."
	npm install 1>/dev/null
	popd 1>/dev/null
	echo "${GREEN}p2e-bot updated.${BLACK}"
fi

if [ -n "$BACKGROUND" ]; then
	VERSION="$BACKGROUND"
	echo "Downloading binary..."
	if [ -f "p2e-background" ]; then
		mv p2e-background p2e-background-old
	fi
	curl -L "https://github.com/truebluejason/p2e-background/releases/download/v${VERSION}/p2e-background" -o p2e-background 2>/dev/null
	chmod +x p2e-background
	echo "${GREEN}p2e-background updated.${BLACK}"
fi

popd 1>/dev/null
echo "${GREEN}Done!${BLACK}"