#!/bin/sh
#
# Use lssitemap to prime a web site's page cache.
# Send requests in parallel.
#
# Run `npm run build` before running this script.
#

if [ -z $1 ]; then
	echo "Use lssitemap to prime a web site's page cache."
	echo "Send requests in parallel."
	echo "Usage: ./primesitemapp.sh <url> [concurrency]"
	echo
	echo "  url          URL to sitemap, usually in form of:"
	echo "               http://server/sitemap_index.xml"
	echo "  concurrency  Max concurrent requests.  Default 10."
	echo
	echo "Note: Run \`npm run build\` before running this script."
	exit 1
fi

SCRIPT_DIR=$(dirname $0)
URL=$1
CONCURRENCY=${2:-10}

node $SCRIPT_DIR/dist/lssitemap.js $URL | parallel --gnu -j $CONCURRENCY "echo '{}';time wget -q -O /dev/null {}"
