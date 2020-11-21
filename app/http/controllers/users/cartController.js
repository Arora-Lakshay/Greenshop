// Cart Page...
exports.cart = (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-state=0, post-check=0, pre-check=0');
  res.render('users/cart', { title: 'Greenshop | Cart' });
}

// Update Cart...
exports.updateCart = (req, res) => {
  if (!req.session.cart) {
    req.session.cart = {
      items: {},
      totalQty: 0,
      totalPrice: 0
    }
  }
  let { cart } = req.session;
  if (!cart.items[req.body._id]) {
    cart.items[req.body._id] = {
      item: {
        id: req.body._id,
        name: req.body.name,
        price: req.body.price,
        size: req.body.size,
        image: req.body.image
      },
      qty: 1
    }
  } else {
    cart.items[req.body._id].qty += 1;
  }
  cart.totalQty += 1;
  cart.totalPrice = cart.totalPrice + req.body.price;
  res.json({ totalQty: req.session.cart.totalQty });
}

// Increase item Qunatity by One...
exports.increaseQty = (req, res) => {
  const id = req.params.id;
  if (!req.session.cart || !id || !req.session.cart.items[id]) {
    return res.render('error.ejs', { title: '404 Page Not Found', layout: 'layout.ejs' });
  }
  else {
    const { cart } = req.session;
    cart.items[id].qty++;
    cart.totalQty++;
    cart.totalPrice += cart.items[id].item.price;
    return res.redirect('/cart');
  }
}

// Decrease item Qunatity by One...
exports.decreaseQty = (req, res) => {
  const id = req.params.id;
  if (!req.session.cart && !id && !req.session.cart.items[id]) {
    return res.render('error.ejs', { title: '404 Page Not Found', layout: 'layout.ejs' });
  }
  else {
    const { cart } = req.session;
    cart.items[id].qty--;
    cart.totalQty--;
    cart.totalPrice -= cart.items[id].item.price;
    if (cart.items[id].qty <= 0) {
      delete cart.items[id];
    }
    if (cart.totalQty <= 0) {
      delete req.session.cart;
    }
    return res.redirect('/cart');
  }
}

// Remove item from cart...
exports.removeItem = (req, res) => {
  const id = req.params.id;
  if (!req.session.cart && !id && !req.session.cart.items[id]) {
    return res.render('error.ejs', { title: '404 Page Not Found', layout: 'layout.ejs' });
  }
  else {
    const { cart } = req.session;
    cart.totalQty -= cart.items[id].qty;
    cart.totalPrice -= cart.items[id].item.price * cart.items[id].qty;
    delete cart.items[id];
    if (cart.totalQty <= 0) {
      delete req.session.cart;
    }
    return res.redirect('/cart');
  }
}