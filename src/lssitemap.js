const fs = require('fs');
const url = require('url');
const dom = require('xmldom');
const xpath = require('xpath');
const commandLineArgs = require('command-line-args');
const rp = require('request-promise');
const _ = require('lodash');
const Promise = require('bluebird');

const optionDefinitions = [
  { name: 'file', type: String, defaultOption: true },
  { name: 'format', type: String, defaultValue: 'text' }
];

const options = commandLineArgs(optionDefinitions);

if (_.isNil(options.file)) {
  console.log('Error: Sitemap URL is required.\n');
  process.exit(1);
}

fetchSiteMap(options.file)
  .then(renderOutput);

function renderOutput(resourceUrls) {
  switch (options.format) {
    case 'json':
      console.log(JSON.stringify(resourceUrls));
      break;

    case 'text':
    default:
      console.log(_.join(resourceUrls, '\n'));
      break;
  }
}

function fetchSiteMap(url, inputUrls = []) {
  return fetchUrl(url)
    .then(function (content) {
      const parser = new (dom.DOMParser)();
      const select = xpath.useNamespaces({ sm: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
      const document = parser.parseFromString(content);
      const rootNode = _.first(select('/sm:*', document));

      switch (rootNode.nodeName) {
        case 'sitemapindex': {
          // Parse sitemap elements.
          const siteMapNodes = select('sm:sitemap', rootNode);

          return Promise.map(siteMapNodes, function (node) {
            const siteMapUrl = _.first(select('sm:loc/text()', node)).nodeValue;
            return fetchSiteMap(siteMapUrl, inputUrls);
          })
            .then(function (arrays) { return _.flatten(arrays); });
        }

        case 'urlset': {
          // Parse url elements.
          const urlNodes = select('sm:url', rootNode);

          const resourceUrls = _.map(urlNodes, function (node) {
            const resourceUrl = _.first(select('sm:loc/text()', node)).nodeValue;
            return resourceUrl;
          });
          return Promise.resolve(_.concat(inputUrls, resourceUrls));
        }

        default:
          throw new Error(`Unrecognized sitemap root node: ${rootNode}`);
      }
    });
}

function fetchUrl(resourceUrl) {
  const urlObj = url.parse(resourceUrl);

  switch (urlObj.protocol) {
    case 'http:':
    case 'https:':
      return rp({
        content: 'GET',
        url: resourceUrl
      });

    case 'file:':
      return slurpp(urlObj.pathname);

    default:
      throw new Error(`Unrecognized protocol: ${urlObj.protocol}.`);
  }
}

function slurpp(file) {
  return new Promise(function (resolve) {
    fs.readFile(file, 'utf8', function (err, content) {
      resolve(content);
    });
  });
}