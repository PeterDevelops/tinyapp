
const getUserByEmail = (email, database) => {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id].id;
    }
  }
  return false;
}
module.exports = { getUserByEmail };