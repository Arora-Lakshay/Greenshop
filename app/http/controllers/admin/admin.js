const Order = require('../../../models/order');

// The administrator dashboard methods... 
exports.admin = {
  orders(req, res) {
    Order.find({ status: { $ne: 'completed' } }).sort({ createdAt: -1 }).populate('userID', '-password').exec((err, orders) => {
      if (req.xhr) {
        return res.json(orders);
      }
      else {
        return res.render('admin/orders', { layout: 'admin/layout.ejs' });
      }
    });
  },

  status(req, res) {
    Order.updateOne({ _id: req.body.orderId }, { status: req.body.status }, (err, order) => {
      if (err) {
        console.log(err);
        return res.redirect('/admin/orders');
      }
      // Emit Order Updated event...
      const event = req.app.get('event');
      event.emit('orderUpdated', { id: req.body.orderId, status: req.body.status });
      res.redirect('/admin/orders');
    });
  }
}