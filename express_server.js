const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {

  let code = '';
  const lettersNumbers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {
    code += lettersNumbers.charAt(Math.floor(Math.random() * lettersNumbers.legth));

    return code;
  }


};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});

//app.get("/urls.json", (req, res) => {
//  res.json(urlDatabase);
//});
//
//app.get("/hello", (req, res) => {
//  res.send("<html><body>Hello <b>World</b></body></html>\n");
//});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
