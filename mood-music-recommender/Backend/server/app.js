// Loading the environment variables from .env file
require('dotenv').config();

// Importing the modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Google OAuth Setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
    // Save user to DB
    User.findOne({googleId: profile.id})
      .then(user => {
        if (user) return done(null, user);
        const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value
        });
        newUser.save().then(user => done(null, user));
      });
}
));

// Serialize user ID into the session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from the session using the ID
passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/music', require('./routes/music'));
app.use('/api/user', require('./routes/user'));

// Starting the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));