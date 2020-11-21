const stripe = require('stripe')(process.env.SK_TEST);

// Checkout Page...
exports.checkout = (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-state=0, post-check=0, pre-check=0');
  if (!req.session.cart) {
    return res.redirect('/cart');
  } else {
    res.render('checkout.ejs', { title: "Greenshop | Checkout" });
  }
}

// Create a payment-intent for every order...
exports.createPaymentIntent = async (req, res) => {
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.session.cart.totalPrice * 100,
    currency: "inr"
  });
  res.json({
    clientSecret: paymentIntent.client_secret
  });
}