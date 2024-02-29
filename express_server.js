const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => { // main doman
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => { // sub domain
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => { // sub domain
  res.send('<html><body>Hello <b>World</b></body></html>\n');
})

app.listen(PORT, () => { // what port we 
  console.log(`Example app listening on port: ${PORT}`);
});