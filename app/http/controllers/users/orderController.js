const Order = require('../../../models/order');
const moment = require('moment');
const mongoose = require('mongoose');

// Orders Page...
exports.orders = async (req, res) => {
  const orders = await Order.find({ userID: req.user._id }).sort({ 'createdAt': -1 });
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-state=0, post-check=0, pre-check=0');
  res.render('users/orders', { title: 'Greenshop | Orders', orders, moment });
}

// Place new orders from the users...
exports.placeOrder = (req, res) => {
  const { contact, address } = req.body;
  const order = new Order({
    userID: req.user._id,
    items: req.session.cart.items,
    contact,
    address,
  });
  order.save().then(order => {
    Order.populate(order, { path: 'userID' }, (err, updatedOrder) => {
      if (err) {
        req.flash('error', 'Something went wrong');
        return res.redirect('/cart');
      }
      req.flash('success', 'true');
      delete req.session.cart;
      // Emit Order-Placed Event...
      const event = req.app.get('event');
      event.emit('orderPlaced', updatedOrder);
      return res.redirect('/orders');
    });
  }).catch((err) => {
    req.flash('error', 'Something went wrong');
    return res.redirect('/cart');
  });
}

// Track and Update the Live status of orders...
exports.status = async (req, res) => {
  try {
    await mongoose.Types.ObjectId(req.params.id);
  } catch (err) {
    return res.render('error.ejs', { title: '404 Page Not Found' });
  }
  const order = await Order.findById(mongoose.Types.ObjectId(req.params.id));
  if (order && req.user._id.toString() === order.userID.toString()) {
    return res.render('users/status.ejs', { title: 'Greenshop | Track Your Order', order });
  } else {
    return res.render('error.ejs', { title: '404 Page Not Found' });
  }
}