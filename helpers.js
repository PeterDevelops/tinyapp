const { urlDatabase } = require('./database');

const getUserByEmail = (email, database) => {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id].id; // database[id].id
    }
  }
  return undefined;
};

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

module.exports = { 
  getUserByEmail, 
  generateRandomString, 
  urlsForUser
};