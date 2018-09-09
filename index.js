const express = require('express');
const aws4 = require('aws4');
const URL = require('url').URL;

// Those credentials could've been just made public, if not for
// AWS User Agreement.
// So I have to set up a separate service that will hold those credentials
// and sign requests on demand.
const credentials = JSON.parse(process.env.CREDENTIALS);

const app = express();

app.get('/zone/:zone/*', async (req, res, next) => {
  try {
    const response = await handle(req);
    res.send(response);
  } catch (e) {
    return next(e);
  }
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
   error: err.message,
  });
});

async function handle(req) {
  const url = new URL(req.params[0]);
  const host = url.hostname;
  const path = url.pathname;
  const opts = { host, path, signQuery: true };
  const zoneCredentials = credentials.zone[req.params.zone];
  aws4.sign(
    opts,
    { accessKeyId: zoneCredentials.key, secretAccessKey: zoneCredentials.secret },
  );
  return 'https://' + opts.host + opts.path;
}

console.log(`process.env.PORT is ${process.env.PORT}`);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
