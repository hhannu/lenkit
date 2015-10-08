var express = require('express');
var router = express.Router();
var db = require('../db')

/* GET home page. */
router.get('/', function(req, res, next) {
    // user is not logged in
    if(typeof req.session.username === 'undefined') {
        db.connect(req,res);
    }
    else {
        db.getTracks(req,res);
        //res.render('index', { title: 'Lenkit', tracklist: [''], trackpoints: '' });
    }
});

// logout
router.get('/logout', function(req, res) {
    req.session.destroy(function(err){});   
    req.session = null;
    res.location('');
    res.redirect('/');
});

router.get('/login', function(req, res) {   
    res.location('');
    res.redirect('/');  
});

router.post('/login', function(req, res) {
    
    if(typeof req.session.username === 'undefined') {
        db.logIn(req,res);
    }
    else {
        res.location('');
        res.redirect('/');          
    }
});

router.get('/register', function(req, res) {
    
    if(typeof req.session.username === 'undefined') {
        res.render('register', {title: 'Lenkit'})
    }
    else {
        res.location('');
        res.redirect('/');          
    }
});

router.post('/register', function(req, res) {
    
    if(typeof req.session.username === 'undefined') {
        db.register(req,res);
    }
    else {
        res.location('');
        res.redirect('/');          
    }
});

router.post('/addtrack', function(req, res) {
    if(typeof req.session.username !== 'undefined') {
        db.addTrack(req,res);
    }
    else{
        res.location('');
        res.redirect('/');    
    }
});

router.get('/addtrack', function(req, res) {
    res.location('');
    res.redirect('/');    
});

router.get('/about', function(req, res) {    
    res.render('about', {title: 'Lenkit'})
});

module.exports = router;
