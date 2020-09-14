const urlDatabase = require('./testDB');
const users = require('./testUsers')

const getUserByEmail = (newEmail, users) => {
  for (const id in users) {
    if (newEmail === users[id].email) {
      return id;
    }
  } 
  return undefined;
};

function generateRandomString() {
  let code = '';
  const lettersNumbers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {  
    code += lettersNumbers.charAt(Math.floor(Math.random() * lettersNumbers.length));
  }
    return code;
};

const urlForUser = (id) => {
  const tempUrl = {};
  for (let shortUrl in urlDatabase) {  //iterate over urlDatabase
    if (id === urlDatabase[shortUrl].userID) {  //compare our id with the userID of the shortURL.
      tempUrl[shortUrl] = urlDatabase[shortUrl]  // if id's are equal add to the tempURL 
    }
  }
  return tempUrl;
};

module.exports = { getUserByEmail, generateRandomString, urlForUser };
