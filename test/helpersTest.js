const { assert } = require('chai');
const { getUserByEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID); // actual, expected
  });

  it('should return undefined if email does not exist', () => {
    const user = getUserByEmail('fakeEmail@fake.com', testUsers);
    assert.strictEqual(user, undefined); // checks fakeEmail in database, should return undefined since its not there
  });
});