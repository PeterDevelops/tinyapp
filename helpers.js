const getUserByEmail = (email, database) => {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id].id; // database[id].id
    }
  }
  return null;
};

module.exports = { getUserByEmail };