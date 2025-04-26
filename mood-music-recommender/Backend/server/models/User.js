// Importing Mongoose
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {type: String, unique: true},
    name: String,
    email: {type: String, unique: true},
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
    favorites: [{
        id: String,
        title: String,
        artist: String,
        addedOn: {type: Date, default: Date.now}
    }]
});

module.exports = mongoose.model('User', userSchema);