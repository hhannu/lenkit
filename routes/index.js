var express = require('express');
var DOMParser = require('xmldom').DOMParser;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // user is not logged in
    if(typeof req.session.username == 'undefined')
        res.render('login', { title: 'Lenkit' });        
    else
        res.render('index', { title: 'Lenkit', tracklist: [''], trackpoints: '' });
});

// logout
router.get('/logout', function(req, res) {
    req.session.destroy(function(err){});   
    res.location('');
    res.redirect('/');
});

router.get('/login', function(req, res) {   
    res.location('');
    res.redirect('/');  
});

router.post('/login', function(req, res) {
    username = req.body.username || 'Anonymous';
    req.session.username = username;
    res.location('');
    res.redirect('/');
});

router.post('/addtrack', function(req, res) {
    if(typeof req.session.username != 'undefined') {
        //console.log(req.body);
        //console.log(req.files);
        // handle file
        var parser = new DOMParser();
        var xmldoc = parser.parseFromString(req.files.gpxfile.buffer.toString(), "text/xml");
        var points = xmldoc.getElementsByTagName("trkpt");
        
        var trackPoints = [];
	var startTime = xmldoc.getElementsByTagName("time")[0].childNodes[0].nodeValue;
      
        for(i = 0; i < points.length; i++){	  
	    var trkpt = { lat:String, lon:String, time:String };
            trkpt.lat = points[i].getAttribute("lat");
            trkpt.lon = points[i].getAttribute("lon");
            trkpt.time = '';      
            //console.log(trkpt);
            trackPoints.push(trkpt);
        }
        //console.log(trackPoints);
        //console.log(trackPoints.length)
        res.render('index', { title: 'Lenkit', tracklist: [startTime],
			      trackpoints: JSON.stringify(trackPoints) });
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

module.exports = router;
