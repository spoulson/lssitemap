#!/bin/sh
#
# Use lssitemap to prime a web site's page cache.
#
# Run `npm run build` before running this script.
#

if [ -z $1 ]; then
	echo "Use lssitemap to prime a web site's page cache."
	echo "Usage: ./primesitemapp.sh <url>"
	echo
	echo "  url  URL to sitemap, usually in form of:"
	echo "       http://server/sitemap_index.xml"
	echo
	echo "Note: Run \`npm run build\` before running this script."
	exit 1
fi

SCRIPT_DIR=$(dirname $0)
URL=$1

node $SCRIPT_DIR/dist/lssitemap.js $URL | xargs -n1 -I {} sh -c "echo '{}';time wget -q -O /dev/null {}"
