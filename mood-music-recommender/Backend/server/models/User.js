// Importing Mongoose
const mongoose = require('mongoose');

// User schema
const userSchema = new mongoose.Schema({
    googleId: {type: String, unique: true},
    name: String,
    email: {type: String, unique: true},
    // Array to store user's mood history
    moodHistory: [{
        date: {type: Date, default: Date.now},
        mood: String,
        genre: String,
        tracks: [{
            id: String, 
            title: String,
            artist: String,
            previewUrl: String,
            imageUrl: String
        }]
    }],
    // Array to store user's favorite tracks
    favorites: [{
        id: String,
        title: String,
        artist: String,
        addedOn: {type: Date, default: Date.now}
    }]
});

// Exporting the user model
module.exports = mongoose.model('User', userSchema);