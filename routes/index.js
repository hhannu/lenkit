var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // user is not logged in
    if(typeof req.session.username == 'undefined')
        res.render('login', { title: 'Lenkit' });        
    else
        res.render('index', { title: 'Lenkit' });
});

// logout
router.get('/logout', function(req, res) {
    req.session.destroy(function(err){});    
    res.redirect('/');
});

router.get('/login', function(req, res) {   
    res.redirect('/');  
});

router.post('/login', function(req, res) {
    username = req.body.username || 'Anonymous';
    req.session.username = username;
    res.redirect('/');
});

module.exports = router;
