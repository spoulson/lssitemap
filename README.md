# lssitemap
List sitemap resources.

Use to enumerate all URLs in a web site's sitemap.

Compliant with the Sitemap protocol: https://www.sitemaps.org/protocol.html

Sitemaps are found on web sites at URI `/sitemap_index.xml`.

# Pre-requisites
* Unix-based OS like Linux, Mac
* Node 6.9+
* npm 3.10+

# Build
```
npm install
npm run build
```

The built output file is at: `dist/lssitemap.js`

# Usage

```
node dist/lssitemap.js <Sitemap URL>
```

Optional arguments:
* `--format <text|json>`
 * "text": a simple list of one URL per line.
 * "json": an array of URL strings.

Output is rendered to STDOUT.

# Examples
Use a sitemap to warm the page cache.

```
node dist/lssitemap.js <Sitemap URL> | wget -O /dev/null -i -
```

Or, run in parallel for faster runtime:
```
node dist/lssitemap.js <Sitemap URL> | parallel --gnu -j 10 "echo '{}';wget -q -O /dev/null {}"
```
Adjust `-j n` as needed.

