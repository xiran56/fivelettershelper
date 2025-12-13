const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.env.PORT || 3000;
const baseDir = process.env.BASE_DIR || './';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = path.join(baseDir, parsedUrl.pathname);
  
  fs.stat(pathname, (err, stats) => {
    if (err) {
      res.statusCode = 404;
      res.end('File not found');
      return;
    }

    if (stats.isDirectory()) {
      pathname = path.join(pathname, 'index.html');
    }

    const ext = path.parse(pathname).ext;
    const mimeType = mimeTypes[ext] || 'text/plain';

    fs.readFile(pathname, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error reading file');
        return;
      }

      // Special headers for WASM files
      if (ext === '.wasm') {
        res.setHeader('Content-Type', 'application/wasm');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      } else {
        res.setHeader('Content-Type', mimeType);
      }

      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log('Serving files from:', path.resolve(baseDir));
});
