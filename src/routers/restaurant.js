const express = require('express');
const ObjectId = require('mongodb').ObjectID;
const { check, validationResult } = require('express-validator');
const { getRatingAverage, buffertoImage } = require('../../helpers/calculations');
const { auth, notGuest } = require('../../config/auth');
const multer = require('multer');
const router = express.Router();

//Load restaurant model
const Restaurant = require('../models/restaurant');
const Rating = require('../models/rating');

// Load multer and options
const upload = multer({
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload an image document"));
        }
        cb(undefined, true);
    }
});

//Get all restaurants listings

router.get('/restaurants/:method', async (req, res) => {
    let skip = parseInt(req.query.page);
    let page = 1

    if(skip > 1){
        skip = (skip * 10) - 10;
        page+=1
    }else{
        skip = 0;
    }

    try {
        if (req.params.method === 'highest') {
            const companies = await Restaurant.find({}).sort({ rating: -1 }).limit(10).skip(skip);

            res.render('restaurants/all-restaurants', {
                companies,
                page: page,
                method: req.params.method,
                previous: page - 1,
                next: page + 1
            });
        } else if (req.params.method === 'lowest') {
            const companies = await Restaurant.find({}).sort({ rating: 1 }).limit(10).skip(skip);

            res.render('restaurants/all-restaurants', {
                companies,
                page: page,
                method: req.params.method,
                previous: page - 1,
                next: page + 1
            });
        } else if (req.params.method === 'recent') {
            const companies = await Restaurant.find({}).limit(10).skip(skip);

            res.render('restaurants/all-restaurants', {
                companies,
                page: page,
                method: req.params.method,
                previous: page - 1,
                next: page + 1
            });
        }

    } catch (e) {
        res.send(e)
    }
});

//Get add restaurant page
router.get('/restaurant/add', auth, (req, res) => {
    res.render('restaurants/add-restaurant', {
        errors: req.session.errors
    });
    delete req.session.errors;
});

//Search for restaurant
router.post('/restaraunt/search', async (req, res) => {
    let skip = parseInt(req.query.page);
    let page = 1

    if(skip > 1){
        skip = (skip * 10) - 10;
        page+=1
    }else{
        skip = 0;
    }

    const search = req.body.search;

    try {
        const companies = await Restaurant.find({ name: new RegExp(`${search}`, 'gi') }).limit(10).skip(skip);
        res.render('restaurants/search-restaurant', {
            companies,
            page,
            previous: page - 1,
            next: page + 1
        })
    } catch (e) {
        res.send(e)
    }
});



//Get and sort single restaurant listing
router.get('/restaurant/sort/:id/:method', async (req, res) => {

    try {
        if (ObjectId.isValid(req.params.id)) {
            const restaurant = await Restaurant.findOne({ _id: req.params.id });

            if (req.params.method === 'highest') {
                const ratings = await Rating.find({ restaurant: req.params.id }).populate('user').sort({ rating: -1 });

                res.render('restaurants/single-restaurant', {
                    restaurant,
                    ratings
                });
            } else if (req.params.method === 'lowest') {
                const ratings = await Rating.find({ restaurant: req.params.id }).populate('user').sort({ rating: 1 });

                res.render('restaurants/single-restaurant', {
                    restaurant,
                    ratings
                });
            } else if (req.params.method === 'recent') {
                const ratings = await Rating.find({ restaurant: req.params.id }).populate('user');
                res.render('restaurants/single-restaurant', {
                    restaurant,
                    ratings
                })
            }

        } else {
            res.render('index/404', {
                msg: 'Restaurant does not exist'
            })
        }


    } catch (e) {
        res.send(e)
    }
});


//Get restaurant image
router.get("/restaurant/image/:id", async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ _id: req.params.id });

        res.set("Content-Type", `${buffertoImage(restaurant.image)}`);
        res.send(restaurant.image);
    } catch (e) {
        res.status(404).send(e);
    }
});

//Get Review restaurant page
router.get('/restaurant/review/:id', auth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ _id: req.params.id });

        res.render('restaurants/review-page', {
            restaurant
        });
    } catch (e) {
        req.send(e);
    }
});

//Get review images
router.get("/restaurant/review/image/:id", async (req, res) => {
    try {
        const rating = await Rating.findOne({ _id: req.params.id });

        res.set("Content-Type", `${buffertoImage(rating.image)}`);
        res.send(rating.image);
    } catch (e) {
        res.status(404).send(e);
    }
});

//Post review
router.post('/restaurant/review/:id', auth, upload.single('image'), async (req, res) => {

    const image = req.file == undefined ? null : req.file.buffer;

    try {
        const restaurant = await Restaurant.findOne({ _id: req.params.id });
        const rating = new Rating({
            user: req.user,
            restaurant: req.params.id,
            rating: req.body.rating,
            review: req.body.review,
            image: image

        });

        restaurant.ratingNumber.push(req.body.rating);

        //Get single rating for restaurant
        const starRating = getRatingAverage(restaurant.ratingNumber).toFixed(2);

        restaurant.rating = starRating;

        await rating.save();
        await restaurant.save();
        res.status(200).send();
    } catch (e) {
        res.send(e);
    }
});

//Get review images
router.get("/restaurant/review/image/:id", async (req, res) => {
    try {
        const rating = await Rating.findOne({ _id: req.params.id });

        res.set("Content-Type", `${buffertoImage(rating.image)}`);

        res.send(rating.image);
    } catch (e) {
        res.status(404).send(e);
    }
});

//Add restaurant
router.post('/restaurant/add', auth, upload.single('image'), [check('name').not().isEmpty().withMessage('Restaurant must have a name.'),
check('address').not().isEmpty().withMessage('Restaurant must have an address.'),
check('city').not().isEmpty().withMessage('Restaurant must have a city.'),
check('state').not().isEmpty().withMessage('Restaurant must have a state.'),
check('country').not().isEmpty().withMessage('Restaurant must have a country.')
], async (req, res) => {
    const image = req.file == undefined ? null : req.file.buffer;
    const phone = req.body.phone == undefined ? null : req.body.phone;

    let errors = validationResult(req).array();
    if (errors.length > 0) {
        req.session.errors = errors;
        res.redirect('/restaurants/add');
    } else {
        try {
            const restaurant = new Restaurant({
                name: req.body.name,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                website: req.body.website,
                phone,
                type: req.body.type,
                description: req.body.description,
                image: image
            });

            await restaurant.save();
            req.flash('success_msg', 'Resturant added');
            res.redirect('/');
        } catch (e) {
            res.send(e);
        }
    }
})

module.exports = router;