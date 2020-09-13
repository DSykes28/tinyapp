const getUserByEmail = (newEmail, users) => {
  for (const id in users) {
    if (newEmail === users[id].email) {
      return id;
    }
  } return false;
};

module.exports = getUserByEmail;