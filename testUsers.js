const bcrypt = require('bcrypt');


//Test database of users
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-dinosaur", 10)
  },

 "aJ48lW": {
    id: "aJ48lW",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

module.exports = (users);