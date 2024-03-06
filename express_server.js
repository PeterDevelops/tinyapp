const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const { cookie } = require('request');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true })); // express middleware/parser
app.use(cookieParser());

const generateRandomString = length => {
  let str = '';
  for (let i = 0; i <= length; i++) {
    str += Math.random().toString(36).slice(2);
  }
  return str.slice(0, length);
};

const getSessionId = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId].id;
    }
  }
  return false;
};

const checkExistingEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
};

const checkPassword = (email, password) => {
  for (const userId in users) {
    if (users[userId].email === email && users[userId].password === password) {
      return true;
    }
  }
  return false;
};

const users = {};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get('/', (req, res) => { // main doman
  res.send('Hello!');
});

app.get('/urls', (req, res) => { // subdomain /urls has access to the urls: urlDatabase object
  const userId = req.cookies.user_id;
  const userObject = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user: userObject,
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(400).send('<p>You must be logged in to shorten URLS.</p>')
  }
  const id = generateRandomString(6);
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: id
  }
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const deleteID = req.params.id;
  delete urlDatabase[deleteID];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const randomStr = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send('Email or password is empty.');
  } else if (checkExistingEmail(email)) {
    return res.status(400).send('Email address already exist.');
  } else {
    users[randomStr] = {
      id: randomStr,
      email,
      password
    };
    res.cookie('user_id', randomStr);
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!checkExistingEmail(email)) {
    return res.status(403).send('Invalid email.');
  }
  if (!checkPassword(email, password)) {
    return res.status(403).send('Invalid password.');
  }
  const sessionId = getSessionId(email);
  res.cookie('user_id', sessionId);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const cookieChecker = req.cookies.user_id;
  if (cookieChecker) {
    return res.redirect('/urls');
  }
  res.render('login');
});

app.get('/register', (req, res) => {
  const cookieChecker = req.cookies.user_id;
  if (cookieChecker) {
    return res.redirect('/urls');
  }
  res.render('register');
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
  const templateVars = { user: userObject };
  if (!userId) {
    return res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const userObject = users[userId];
  const id = req.params.id;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[id].longURL,
    user: userObject
  };
  res.render("urls_show", templateVars);
});

app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('<html><body><p>URL does not exist.</p></body></html>');
  }
});

app.listen(PORT, () => { // what port we
  console.log(`Example app listening on port: ${PORT}`);
});