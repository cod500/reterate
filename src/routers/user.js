const express = require('express');
const ObjectId = require('mongodb').ObjectID;
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const uuid = require('uuidv1');
const multer = require('multer');
const User = require('../models/users');
const Rating = require('../models/rating');
const passwordResetEmail = require('../emails/account');
const { getRatingAverage, buffertoImage } = require('../../helpers/calculations');
const { auth, notGuest } = require('../../config/auth');

// Init multer for image upload
const upload = multer({
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload an image document"));
        }
        cb(undefined, true);
    }
});

//Get user profile page
router.get('/user/profile/:id', async (req, res) => {
    let errors;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    try {
        if (ObjectId.isValid(req.params.id)) {
            const profile = await User.findById(req.params.id);
            const ratings = await Rating.find({ user: req.params.id }).populate('user').populate('restaurant');

            res.render('user/profile', {
                profile,
                ratings,
                errors
            });

        } else {
            res.render('index/404', {
                msg: 'User does not exist'
            })
        }


    } catch (e) {
        res.send(e)
    }
});

//Get user image
router.get("/user/image/:id", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });

        res.set("Content-Type", `${buffertoImage(user.image)}`);

        res.send(user.image);
    } catch (e) {
        res.status(404).send(e);
    }
});

//Get registration page
router.get('/register', notGuest, (req, res) => {
    let errors;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    res.render('user/register', {
        errors
    });

});

//Get login form
router.get('/login', notGuest, (req, res) => {
    res.render('user/login', {
        error_msg: req.flash("error")
    });
});

// Register new user
router.post('/register', upload.single('image'), [check('name').not().isEmpty().withMessage('Name is required'),
check('username').not().isEmpty().withMessage('Email is required').isEmail().withMessage("Invalid email").custom(async (value, { req }) => {
    const user = await User.findOne({ email: value });
    if (user) {
        throw new Error('Email already exits');
    }
    // Indicates the success of this synchronous custom validator
    return true;
}),
check('password').not().isEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage("Password must be more than 8 characters"),
check('confirm').not().isEmpty().withMessage('Must confirm password').custom((value, { req }) => {
    if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
    }
    // Indicates the success of this synchronous custom validator
    return true;
})],
    async (req, res) => {

        const image = req.file == undefined ? null : req.file.buffer;
        let errors = validationResult(req).array();

        if (errors.length > 0) {

            req.session.errors = errors;
            res.redirect('/register');
        } else {
            try {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.username,
                    password: await bcrypt.hash(req.body.password, 8),
                    image
                });

                await newUser.save();
                req.flash("success_msg", "Welcome!");
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/");
                });

            } catch (e) {
                res.send(e)
            }
        }
    });

//User login request
router.post("/login", passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    failureFlash: "Invalid username or password"
}), (req, res) => {
    if (req.body.remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
    } else {
        req.session.cookie.expires = false; // Cookie expires at end of session
    }
    res.redirect('/');
});


// Update user information
router.put('/user/update/:id', [check('name').not().isEmpty().withMessage('Name is required'),
check('username').not().isEmpty().withMessage('Email is required').isEmail().withMessage("Invalid email"),
check('password').not().isEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage("Password must be more than 8 characters"),
check('confirm').not().isEmpty().withMessage('Must confirm password').custom((value, { req }) => {
    if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
    }
    // Indicates the success of this synchronous custom validator
    return true;
})],
    async (req, res) => {

        try {
            let errors = validationResult(req).array();

            if (errors.length > 0) {
                req.session.errors = errors;
                res.redirect(`/user/profile/${req.params.id}`);
            } else {
                user.name = req.body.name;
                user.email = req.body.username;
                user.password = await bcrypt.hash(req.body.password, 8);

                await user.save();
                req.flash("success_msg", "Successfully Updated");
                res.redirect(`/user/profile/${req.params.id}`);

            }
        } catch (e) {
            res.send(e)
        }
    });

//Get forgot password form
router.get('/reset', (req, res) => {
    res.render('user/password-reset')
});

//Request password reset 
router.post('/reset', async (req, res) => {
    const email = req.body.email;
    const token = uuid();

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            req.flash('error_msg', 'No such user exists');
            res.redirect('/reset');
        } else {
            user.passwordResetToken = token;
            user.passwordResetExpire = Date.now();
            passwordResetEmail(user.email, token);
            await user.save();
            req.flash('success_msg', 'Reset link has been sent to email');
            res.redirect('/reset');
        }
    } catch (e) {
        res.status(500).send(e)
    }
});

//Get forgot password form
router.get('/reset/:token', notGuest, async (req, res) => {
    const user = await User.findOne({ passwordResetToken: req.params.token, passwordResetExpire: { $gt: Date.now() } });
    if (!user) {
        req.flash('error_msg', 'Password reset token has expired');
        res.redirect('/register');
    } else {
        res.render('user/set-new-password', {
            errors: req.session.errors,
            user
        });
        delete req.session.errors
    }
});

//Reset password form put request
router.put('/reset/:token', [check('password').not().isEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage("Password must be more than 8 characters"),
check('confirm').not().isEmpty().withMessage('Must confirm password').custom((value, { req }) => {
    if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
    }
    // Indicates the success of this synchronous custom validator
    return true;
})],
    async (req, res) => {
        let errors = validationResult(req).array();
        if (errors.length > 0) {
            req.session.errors = errors;
            res.redirect(`/reset/${req.params.token}`);
        } else {
            try {
                const user = await User.findOne({ passwordResetToken: req.params.token });
                if (!user) {
                    req.flash('error_msg', 'Invalid password change request');
                    res.redirect('/register');
                } else {
                    user.password = await bcrypt.hash(req.body.password, 8);
                    user.passwordResetToken = null;
                    user.passwordResetExpire = null;
                    await user.save();
                    req.flash('success_msg', 'Password has been reset, you may now log in');
                    res.redirect('/login')
                }
            } catch (e) {
                res.send(e);
            }
        }
    });

//Log out of current user
router.get("/logout", auth, (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        res.redirect('/');
    })
});



module.exports = router;

