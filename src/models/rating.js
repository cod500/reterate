const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurants'
    },
    rating: {
        type: Number, 
        default: 0
    }
    ,
    review: {
        type: String, 
        default: ''
    },
    image:{
        type: Buffer
    },
    date: {
        type: Date,
        default: Date.now 
    }
});

const Rating = mongoose.model('ratings', RatingSchema, 'ratings');
module.exports = Rating;