const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert(user === expectedOutput);    // Write your assert statement here
  });
  it('test that a non-existent email returns undefined', function() {
    const user = getUserByEmail("user@asdkaj.com", testUsers)
        assert.isUndefined(user, 'user is undefined');    // Write your assert statement here
  });

});
