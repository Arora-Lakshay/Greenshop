const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Event = require('events');
const layout = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const passportInit = require('./app/config/passport');

const app = express();

// Set Template Engine...
app.set('views', path.join(__dirname, '/src/views/'));
app.set('view engine', 'ejs');

// Database Configuration...
const url = process.env.MONGO_URI;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).then(() => console.log('Connected to Database...')).catch((err) => console.log(`[ERROR]: "${err.message}"`));

// Event-Emitter Configuration for SocketIO Status Updates...
const event = new Event();
app.set('event', event);

// Session Configurations...
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  rolling: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60, sameSite: "lax" }, // Expires after 1 hours
  store: new MongoStore({ mongooseConnection: mongoose.connection, collection: 'sessions' })
}));

// Middlewares...
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(layout);

// Authentication Configurations...
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

// Custom Global Middleware for setting local variables...
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

// Routes Configuration...
app.use('/', require('./routes/routes'));

// Server Configuration...
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));

// SocketIO Configurations...
const io = require('socket.io')(server);

io.on('connection', socket => {
  socket.on('join', room => {
    socket.join(room);
  });
});

event.on('orderUpdated', data => {
  io.to(`order_${data.id}`).emit('orderUpdated', data);
});

event.on('orderPlaced', order => {
  io.to('dashboard').emit('orderPlaced', order);
});