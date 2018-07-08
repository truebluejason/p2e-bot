#!/bin/bash

set -e

BLACK=`tput sgr0`
RED=`tput setaf 1`
GREEN=`tput setaf 2`

if [ -z "$VERSION" ]; then
	echo "${RED}You must supply the version of p2e-bot and p2e-background.${BLACK}"
	echo "Example Usage: VERSION='1.0.0' ./update_code.sh"
	exit 1
fi

echo "Starting Update..."
pushd ~/code

curl -L "https://github.com/truebluejason/p2e-bot/archive/v${VERSION}.tar.gz" -o p2e-bot.tar.gz
tar -zxf p2e-bot.tar.gz
rm p2e-bot.tar.gz
pushd "p2e-bot-${VERSION}"
echo "Running 'npm install'..."
npm install
popd
echo "${GREEN}p2e-bot updated.${BLACK}"

curl -L "https://github.com/truebluejason/p2e-background/releases/download/v${VERSION}/p2e-background" -o p2e-background
chmod +x p2e-background
echo "${GREEN}p2e-background updated.${BLACK}"

popd
echo "${GREEN}Done!${BLACK}"