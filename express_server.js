const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

const generateRandomString = length => {
  let str = '';
  for (let i = 0; i <= length; i++) {
    str += Math.random().toString(36).slice(2);
  }
  return str.slice(0, length);
};

app.use(cookieParser());

app.set('view engine', 'ejs');

const users = {
  
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.use(express.urlencoded({ extended: true })); // express middleware/parser

app.get('/', (req, res) => { // main doman
  res.send('Hello!');
});

app.get('/urls', (req, res) => { // subdomain /urls has access to the urls: urlDatabase object
  const userId = req.cookies.user_id;
  const userObject = users[userId];
  const templateVars = {
  urls: urlDatabase,
  user: userObject
};
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const deleteID = req.params.id;
  delete urlDatabase[deleteID];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls')
});

app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.user_id)
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const randomStr = generateRandomString(6);
  users[randomStr] = {
    id: randomStr,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', randomStr);
  console.log(users);
  res.redirect('/urls')
});

app.get('/register', (req, res) => {
  res.render('register')
});

app.get('/urls.json', (req, res) => { // sub domain
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => { // sub domain
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls/new', (req, res) => {
  const userId = req.cookies.user_id;
  const userObject = users[userId];
  const templateVars = { user: userObject }
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const userObject = users[userId];
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userObject
  };
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