const Menu = require('../../models/menu');

// Home Page...
exports.home = (req, res) => {
  Menu.find().then(pizzas => res.render('home', { title: 'Greenshop | Home', pizzas })).catch(err => res.status(500).send('Internal Server Error'));
}

// 404 Page Not Found...
exports.error = (req, res) => {
  return res.render('error.ejs', { title: '404 Page Not Found' });
}