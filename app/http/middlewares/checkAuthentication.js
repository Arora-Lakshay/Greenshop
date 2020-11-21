// Checks if the User is Logged-in
exports.checkNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
}

// Verifies user on Private routes...
exports.checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

// Verifies Administrator Priviledges..
exports.verifyAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'administrator') {
    return next();
  } else {
    return res.render('error.ejs', { title: '404 Page Not Found', layout: 'layout.ejs' });
  }
}