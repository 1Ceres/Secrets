require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();
const port = process.env.PORT || 3000;


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {}
}));
app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://localhost:27017/userDB", () => console.log("MongoDB connected on 27017"));

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(new passportLocal(User.authenticate()));
// passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout(function(){
    res.redirect("/");
  }) ;
});

app.post("/register", function(req, res) {
//not fully understand user.register and passport.authenticate => read more
  User.register({username: req.body.username}, req.body.password , function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets")
      });
    }
  });
});

app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});







app.listen(port, () => console.log("Server is up and running on port: " + port));
