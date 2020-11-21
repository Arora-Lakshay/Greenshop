const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

// Login Page...
exports.login = (req, res) => {
  res.render('auth/login', { title: 'Greenshop | Login', layout: 'auth/raw-layout' });
}

// Register Page...
exports.register = (req, res) => {
  res.render('auth/register', { title: 'Greenshop | Register', layout: 'auth/raw-layout' });
}

// Register new user...
exports.createUser = (req, res) => {
  const { username, email, password } = req.body;
  User.exists({ email }).then(async (user) => {
    if (user) {
      req.flash("error", "Email is already in use");
      req.flash('name', username);
      req.flash('email', email);
      return res.redirect('/register');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: username,
      email,
      password: hashedPassword
    });

    newUser.save().then(user => {
      res.redirect('/login');
    }).catch(err => {
      req.flash("error", "Something went wrong");
      res.redirect('/register');
    });
  }).catch(err => {
    req.flash("error", "Something went wrong");
    res.redirect('/register');
  });
}

// Logging-in with user...

/*
 * exports.loginUser = passport.authenticate('local', {
 *   successRedirect: '/',
 *   failureRedirect: '/login',
 *   failureFlash: true
 * });
 */

exports.loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      req.flash('error', info.message);
      return next(err);
    }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        req.flash('error', info.message)
        return next(err);
      }
      if (req.user.role === "administrator") {
        return res.redirect('/admin/orders');
      } else {
        return res.redirect('/orders');
      }
    });
  })(req, res, next);
}

// Logging-Out the user...
exports.logOut = (req, res) => {
  req.logout();
  return res.redirect('/login');
}