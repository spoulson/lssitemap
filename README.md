# lssitemap
List sitemap resources.

Use to enumerate all URLs in a web site's sitemap.

# Pre-requisites
* Node 6+
* npm 3.10+

# Build
```
npm install
npm run build
```

The built output file is in `dist/lssitemap.js`.

# Usage

```
node dist/lssitemap.js <Sitemap URL>
```

Optional arguments:
* `--format <text|json>`
 * "text": a simple list of one URL per line.
 * "json": an array of URL strings.

Output is rendered to STDOUT.
