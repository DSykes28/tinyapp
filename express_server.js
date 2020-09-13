const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const getUserByEmail = require('./helpers')


//app.use(cookieParser())
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

function generateRandomString() {

  let code = '';
  const lettersNumbers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {
  
    code += lettersNumbers.charAt(Math.floor(Math.random() * lettersNumbers.length));
  }

    return code;
};

//Database of items
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  a3EfiX: { longURL: "https://cbc.ca", userID: "userRandomID"}
};


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

const urlForUser = (id) => {
  const tempUrl = {};
  for (let shortUrl in urlDatabase) {  //iterate over urlDatabase
    if (id === urlDatabase[shortUrl].userID) {  //compare our id with the userID of the shortURL.
      tempUrl[shortUrl] = urlDatabase[shortUrl]  // if id's are equal add to the tempURL 
    }
  }
  return tempUrl;
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get('/register', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.session.user_id
  }
  res.render('register',templateVars)
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
  res.redirect('/urls');
}
});

app.get("/login", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.longURL],
    user_id: req.session.user_id
  }
  res.render('login', templateVars)
});

app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === ""){
    res.status(400).send('Please enter info');
    
  } else if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send('Error email not found!');
    
  } else if (bcrypt.compareSync(req.body.password, users[getUserByEmail(req.body.email, users)].password)) {
    req.session.user_id = getUserByEmail(req.body.email, users);
    res.redirect('/urls');
  } else {
    res.status(403).send('Please try your password again');
  }
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.render('login');
  } else {

    let templateVars = {
      user_id: req.session.user_id,
      urls: urlForUser(req.session.user_id),
    } 
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //console.log(longURL);  // Log the POST request body to the console
  urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = {longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`)
})

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.render('login');
  } else {
  const templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.session.user_id};
    res.render("urls_new", templateVars);  
  }  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let templateVars = {
    urls: urlForUser(req.session.user_id),
    user_id: req.session.user_id
  };
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userId === urlDatabase[shortURL].userID) {
    res.send('You do not have permission to change this url.');
    
  } else {
    let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.longURL],
      user_id: req.session.user_id
    }
    res.render("urls_show", templateVars);  
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/logout', (req, res) => {
  req.session.user_id = '';
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//app.get("/hello", (req, res) => {
//  res.send("<html><body>Hello <b>World</b></body></html>\n");
//});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});