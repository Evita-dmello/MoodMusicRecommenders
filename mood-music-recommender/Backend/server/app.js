require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // ADDED: Import User model

// Initialize Express app
const app = express();

// Configuration Check
console.log('[DEBUG] Environment Variables Loaded:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_CONNECTED: !!process.env.MONGODB_URI,
  GOOGLE_OAUTH: !!process.env.GOOGLE_CLIENT_ID
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'fallback-secret', // ADDED fallback
  resave: false, 
  saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());

// Database Setup
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moodtunes')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1); // ADDED: Exit on DB connection failure
  });

// Passport Setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, 
async (accessToken, refreshToken, profile, done) => {
  try {
    // ADDED try-catch and await/async
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
      });
      await user.save();
    }
    
    // ADDED JWT token generation
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    user.token = token; // Attach token to user
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    token: user.token // Include token in session
  });
});

passport.deserializeUser(async (obj, done) => {
  try {
    const user = await User.findById(obj.id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Route Setup - MOVED BELOW passport config
const authRouter = require('./routes/auth');
const musicRouter = require('./routes/music');
const userRouter = require('./routes/user');

// ADDED route validation
if (typeof authRouter !== 'function' || 
    typeof musicRouter !== 'function' || 
    typeof userRouter !== 'function') {
  console.error('Route handlers are not functions!');
  process.exit(1);
}

app.use('/api/auth', authRouter);
app.use('/api/music', musicRouter);
app.use('/api/user', userRouter);

// ADDED Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});