require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


function isUrlValid(userInput) {
  const res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if(res == null){
    return false;
  }
  return true;
}

const shortURLMap = new Map();

function findShortURLByValue(searchValue) {
  for (let [key, value] of shortURLMap.entries()) {
    if (value === searchValue)
      return key;
  }
  return null;
}

function findOrCreateShortURL(url){
  let shortURL = findShortURLByValue(url);
  if (!shortURL){
    shortURL = shortURLMap.size + 1;
    shortURLMap.set(String(shortURL), url);
  }
  return shortURL;
}

app.post('/api/shorturl', function(req, res){
  const url = req.body.url
  if (!isUrlValid(url)){
    res.json({
      error: 'invalid url'
    });
    return;
  }
  const shortUrl = findOrCreateShortURL(url);
  res.json({
    original_url: url,
    short_url: shortUrl
  })
})

app.get('/api/shorturl/:shorturl', function(req, res){
  const url = shortURLMap.get(req.params.shorturl);
  if (!url){
    res.sendStatus(404);
    return;
  }
  res.redirect(url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
