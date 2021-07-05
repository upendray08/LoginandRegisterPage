
// secret code related stuffs
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// import 
const ejs = require("ejs");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const passport = require("passport");
const initializePassport = require("./password-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
// function 
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

// port 
const port = 4500;
// user database local Storage 
const users = [];
// app set 
app.set("view-engine", "ejs");
// app use 
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// app get request to res 
app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checknotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/register", checknotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

// post req  
app.post(
  "/login",
  checknotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
app.post("/register", checknotAuthenticated, async (req, res) => {
  try {
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedpassword,
    });

    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checknotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(port);
