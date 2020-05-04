const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String
    },
    type: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    website: {
        type: String
    },
    phone: {
        type: String
    },
    image: {
        type: Buffer
    },
    ratingNumber: [Number],
    rating: {
        type: Number, default: 0
    }
});

const Restaurant = mongoose.model('restaurants', RestaurantSchema, 'restaurants');

module.exports = Restaurant;