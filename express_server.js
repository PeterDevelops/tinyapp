const express = require('express');
const app = express();
const PORT = 8080;

const generateRandomString = length => {
  let str = '';
  for (let i = 0; i <= length; i++) {
    str += Math.random().toString(36).slice(2);
  }
  return str.slice(0, length);
};

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.use(express.urlencoded({ extended: true })); // express middleware/parser

app.get('/', (req, res) => { // main doman
  res.send('Hello!');
});

app.get('/urls', (req, res) => { // subdomain /urls has access to the urls: urlDatabase object
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls.json', (req, res) => { // sub domain
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => { // sub domain
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id , longURL: urlDatabase['id'] };
  res.render("urls_show", templateVars);
});

app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
      res.status(404).send('URL Not Found.')
  }
});

app.listen(PORT, () => { // what port we
  console.log(`Example app listening on port: ${PORT}`);
});