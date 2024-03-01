const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => { // main doman
  res.send('Hello!');
});

app.get('/urls', (req, res) => { // subdomain /urls has access to the urls: urlDatabase object
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
})

app.get('/urls.json', (req, res) => { // sub domain
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => { // sub domain
  res.send('<html><body>Hello <b>World</b></body></html>\n');
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id , longURL: urlDatabase['id'] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => { // what port we
  console.log(`Example app listening on port: ${PORT}`);
});