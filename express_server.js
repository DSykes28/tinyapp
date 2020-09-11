const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

app.use(cookieParser())
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
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur",
  },

 "user2RandomID": {
    id: "aJ48lW",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};

const lookUpByEmail = ( newEmail) => {
  for (const id in users) {
    if (newEmail === users[id].email) {
      return id;
    }
  } return false;
};

const urlForUser = (id) => {
  const tempUrl = {};
  for (let shortUrl in urlDatabase) {
    if (id === urlDatabase[shortUrl].userID) {
      tempUrl[shortUrl] = urlDatabase[shortUrl]
    }
  }

  return tempUrl;
  //iterate over urlDatabase
  //compare our userID with the userId of the shortURL.
  // if ID's are equal add to the tempURL
  
}

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get('/register', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies.user_id
  }
  res.render('register',templateVars)
});

app.post("/register", (req, res) => {
if (req.body.email === "" || req.body.password === "") {
  res.status(400).send('Error 404 - Please fill in the fields')
  
} else if (lookUpByEmail(req.body.email)) {
  res.status(403).send('Error 403 -  Sorry email already in use')
  
} else {
  let user_id = generateRandomString();
  users[user_id] = { id: user_id, email: req.body.email, password: req.body.password };
  console.log(users);
  res.cookie('user_id', user_id);
  res.redirect('/urls');
}
});

app.get("/login", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.longURL],
    user_id: req.cookies.user_id
  }
  res.render('login', templateVars)
});

app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === ""){
    res.status(400).send('Please enter info');
    
  } else if (!lookUpByEmail(req.body.email)) {
    res.status(403).send('Error email not found!');
    
  } else if (req.body.password === users[lookUpByEmail(req.body.email)].password) {
    res.cookie('user_id', lookUpByEmail(req.body.email));
    res.redirect('/urls');
  } else {
    res.status(403).send('Please try your password again');
  }
});

app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.render('login');
  } 
  let templateVars = {
    urls: urlForUser(req.cookies.user_id),
    user_id: req.cookies.user_id
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //console.log(longURL);  // Log the POST request body to the console
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  console.log(shortURL);
  res.redirect(`/urls/${shortURL}`)
})

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"],};
  
    res.render("urls_new", templateVars);  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let templateVars = {
    urls: urlForUser(req.cookies.user_id),
    user_id: req.cookies.user_id
  };
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  if (userId === urlDatabase[shortURL].userID) {
    let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.longURL],
      user_id: req.cookies['user_id']
    };
    res.render("urls_show", templateVars);
  } else {
    res.send('You do not have permission to change this url.'); 
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id',);
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