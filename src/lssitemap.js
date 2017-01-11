import fs from 'fs';
import url from 'url';
import xmldom from 'xmldom';
import xpath from 'xpath';
import commandLineArgs from 'command-line-args';
import rp from 'request-promise';
import _ from 'lodash';
import Promise from 'bluebird';

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
    .then(content => {
      const parser = new (xmldom.DOMParser)();
      const select = xpath.useNamespaces({ sm: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
      const document = parser.parseFromString(content);
      const rootNode = _.first(select('/sm:*', document));

      switch (rootNode.nodeName) {
        case 'sitemapindex': {
          // Parse sitemap elements.
          const siteMapNodes = select('sm:sitemap', rootNode);

          return Promise.map(siteMapNodes, node => {
            const siteMapUrl = _.first(select('sm:loc/text()', node)).nodeValue;
            return fetchSiteMap(siteMapUrl, inputUrls);
          })
            .then(arrays => _.flatten(arrays));
        }

        case 'urlset': {
          // Parse url elements.
          const urlNodes = select('sm:url', rootNode);

          const resourceUrls = _.map(urlNodes, node => {
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
  return new Promise(resolve => {
    fs.readFile(file, 'utf8', (err, content) => {
      resolve(content);
    });
  });
}
