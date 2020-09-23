const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const urlDatabase = require('./testDB');
const users = require('./testUsers');
const { generateRandomString } = require('./helpers');
const { getUserByEmail } = require('./helpers');
const { urlForUser } = require('./helpers');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.set('view engine', 'ejs');
app.use(morgan('dev'));


const bodyParser = require("body-parser");
const { json } = require("body-parser");
const e = require("express");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else { 
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.session.user_id
    }
  res.render('register',templateVars)
  }
});

app.post("/register", (req, res) => {
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Error 404 - Please fill in the fields')
    
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(403).send('Error 403 -  Sorry email already in use')
    
  } else {
    let user_id = generateRandomString();
    users[user_id] = { id: user_id, email: req.body.email, password: hashedPassword };
    req.session.user_id = user_id; 
    req.session.user_email = req.body.email;
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {  
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.longURL],
    user_id: req.session.user_id
    }
    res.render('login', templateVars)
  }
});

app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === ""){
    res.status(400).send('Please enter info');
    
  } else if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send('Error email not found!');
    
  } else if (bcrypt.compareSync(req.body.password, users[getUserByEmail(req.body.email, users)].password)) {
    req.session.user_id = getUserByEmail(req.body.email, users);
    req.session.user_email = req.body.email;
    res.redirect('/urls');
  } else {
    res.status(403).send('Please try your password again');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = '';
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send('please log in');
  } else {

    let templateVars = {
      user_id: req.session.user_id,
      urls: urlForUser(req.session.user_id),
      user_email: req.session.user_email
    } 
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
  res.redirect('/urls/');
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
  const templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.session.user_id,
    user_email: req.session.user_email}
    res.render("urls_new", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = {longURL, userID: req.session.user_id };
  res.redirect('/urls/')
})

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send('you do not have permissions to that url')
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  if (!urlDatabase.hasOwnProperty(req.params.shortURL)) {
    res.send("Page doesn't exist");
  } else if (userId !== urlDatabase[shortURL].userID) {
    res.send('You do not have permission to change this url.');
    
  } else {
    let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id: req.session.user_id,
      user_email: users[req.session.user_id].email
    }
    res.render("urls_show", templateVars);  
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});