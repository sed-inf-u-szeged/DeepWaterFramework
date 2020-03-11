const express = require('express');
const compression = require('compression');
const proxy = require('http-proxy-middleware');

const ES_ADDRESS = 'http://10.3.7.79:9200';
const PORT = 4200;
const PATH = `${__dirname}/dist/DWF-angular-ui`;
const DEFAULT = `${PATH}/index.html`;

const app = express();
app.use(compression());
app.use('/api', proxy({ target: ES_ADDRESS, pathRewrite: { '^/api': '' }, changeOrigin: true }));
app.use('/', express.static(PATH));
app.get('/*', (_, res) => res.sendFile(DEFAULT));
app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
