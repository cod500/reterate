const express = require('express');
const router = express.Router();

//Load Company model
const Restaurant = require('../models/restaurant');

router.get('/', async (req, res) => {
    try{
        const companies = await Restaurant.find({}).limit(6);
        res.render('index/index', {
            companies
        })
    }catch(e){
        res.send(e);
    }
  });

  module.exports = router;
