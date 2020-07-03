const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../src/models/users');

module.exports = function (passport) {
  //Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(username, password)
        user = await User.findOne({ email: username });
        if (!user) {
          return done(null, false);
        }
      } catch (e) {
        return (e);
      }
      let match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false);
      }
      return done(null, user);
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });


  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
}
