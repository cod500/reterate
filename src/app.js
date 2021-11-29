const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const passport = require('passport');
const flash = require('connect-flash');
const { equal, getPages, getNext, getPrev, formatDate, formatNumber } = require('../helpers/hbs');

const path = require('path');

//Load mongoose
require('./db/mongoose');

const app = express();

//Handlebars middleware
app.engine('handlebars', hbs({
  defaultLayout: "main",
  helpers: {
    equal,
    getPages,
    getNext,
    getPrev,
    formatDate,
    formatNumber
  }
}));
app.set('view engine', 'handlebars');


//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

//Static files in public folder
app.use(express.static(path.join("public")));

//Method ovverride middleware
app.use(methodOverride('_method'))

//Express Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(cookieParser());

//Flash middleware
app.use(flash());

//Passport middleware
require('../config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

//Set global variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
})

//Load app routers
const indexRouter = require('./routers/index');
const userRouter = require('./routers/user');
const restaurantRouter = require('./routers/restaurant');

app.use(indexRouter);
app.use(userRouter);
app.use(restaurantRouter);

app.get('/*', (req, res) => {
  res.render('index/404', {
    msg: "Sorry, this page doesn't exist."
  });
})


const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Connected on port ${port}`)
})