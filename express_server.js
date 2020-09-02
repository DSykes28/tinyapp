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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userObj = {
  id: "01",
  username: "DSykes",
  email: "",
  password: "Some password"
};

app.get("/", (req, res) => {
  console.log('Cookies:', req.cookies);
  res.send("Hello!");
  console.log('Signed Cookies:', req.signedCookies);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase,
    username: req.cookies['username'], };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],};
    res.render("urls_new", templateVars);  
});

app.post("/login", (req, res) => {
  const username = req.body.username
    res.cookie('username', username);
    res.redirect('/urls');
});

app.get("/login", (req, res) => {
  
  res.render('login')
});

app.get('/register', (req, res) => {
  const username = req.body.username;
  res.render('register')
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

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username']
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/logout', (req, res) => {
  res.clearCookie('username',);
  res.redirect('/urls')
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