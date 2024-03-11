const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
// const { cookie } = require('request');
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3']
}));

const generateRandomString = (length) => {
  let str = '';
  for (let i = 0; i <= length; i++) {
    str += Math.random().toString(36).slice(2);
  }
  return str.slice(0, length);
};

const urlsForUser = (id) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURLs;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

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

app.get('/', (req, res) => {
  res.send('Hello!');
});

// main page
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send('<html><body><h3>Please <a href="http://localhost:8080/login">Login</a> or <a href="http://localhost:8080/register">Register</a>.</h3></body></html>');
  }
  const userURLs = urlsForUser(userId);
  const userObject = users[userId];
  const templateVars = {
    urls: userURLs,
    user: userObject
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send('<html><body><h3>You must be logged in to shorten URLS</h3></body></html>');
  }
  const id = generateRandomString(6);
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: userId
  };
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const currentlyLoggedIn = req.session.user_id;
  const id = req.params.id;
  const urls = urlDatabase[id];
  if (!currentlyLoggedIn) { // checks if user is not logged in
    return res.status(401).send('<html><body><h3>Please <a href="http://localhost:8080/login">Login</a> or <a href="http://localhost:8080/register">Register</a>.</h3></body></html>');
  }
  if (!urls) { // checks if url exists
    return res.status(401).send('<html><body><h3>URL Not Found.</h3></body></html>');
  }
  if (urls.userID !== currentlyLoggedIn) { // checks if the current logged in user is the owner
    return res.status(401).send('<html><body><h3>You do not have access to this.</h3></body></html>');
  }
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const currentlyLoggedIn = req.session.user_id;
  if (!currentlyLoggedIn) {// if user is logged in
    return res.status(401).send('<html><body><h3>Please <a href="http://localhost:8080/login">Login</a> or <a href="http://localhost:8080/register">Register</a>.</h3></body></html>');
  }
  const id = req.params.id;
  const urls = urlDatabase[id];
  if (!urls) { // if id exists in urlDatabase[id]
    return res.status(401).res.send('<html><body><h3>URL Not Found.</h3></body></html>');
  }
  if (urls.userID !== currentlyLoggedIn) { // checks if user owns url
    return res.status(403).send('<html><body><h3>You do not have access to this.</h3></body></html>');
  }
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const randomStr = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = getUserByEmail(email, users);
  if (!email || !hashedPassword) { // checks if email and password is empty string
    return res.status(400).send('Email or password is empty.');
  } else if (userId) { // checks if our email exists in users
    return res.status(400).send('Email address already exist.');
  } else {
    users[randomStr] = {
      id: randomStr,
      email,
      hashedPassword
    };
    req.session.user_id = randomStr;
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = getUserByEmail(email, users);
  if (!userId) {
    return res.status(401).send('Invalid email.');
  }
  const checkHashedPassword = bcrypt.compareSync(password, users[userId].hashedPassword);
  if (!checkHashedPassword) {
    return res.status(401).send('Invalid password.');
  }
  req.session.user_id = userId;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const cookieChecker = req.session.user_id;
  if (cookieChecker) {
    return res.redirect('/urls');
  }
  res.render('login');
});

app.get('/register', (req, res) => {
  const cookieChecker = req.session.user_id;
  if (cookieChecker) {
    return res.redirect('/urls');
  }
  res.render('register');
});


app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect('/login');
  }
  const userObject = users[userId];
  const templateVars = {
    user: userObject
  };
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  const url = urlDatabase[id];
  if (!userId) { // if cookie doesnt exist / not logged in
    return res.status(401).send('<html><body><h3>Please <a href="http://localhost:8080/login">Login</a> or <a href="http://localhost:8080/register">Register</a>.</h3></body></html>');
  }
  if (!url) { // if id does not exist
    return res.status(401).send('<html><body><h3>URL Not Found.</h3></body></html>');
  }
  if (url.userID !== userId) { // if user does not own url
    return res.status(403).send('<html><body><h3>Unable to access, user not authorized.</h3></body></html>');
  }
  const userObject = users[userId];
  const templateVars = {
    id: req.params.id,
    longURL: url.longURL,
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