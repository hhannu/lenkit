var mongoose = require('mongoose');
var DOMParser = require('xmldom').DOMParser;
var bcrypt = require('bcrypt-nodejs');
var GeoPoint = require('geopoint');

// default to a 'localhost' configuration:
var connection_string = 'mongodb://127.0.0.1:27017/lenkit';

// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  connection_string = 'mongodb://' + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

var user = new mongoose.Schema({
    username: {type: String, index: {unique:true}},
    password: String,
    email: String,
    metric: Boolean
});

var User = mongoose.model('User', user);

var track = new mongoose.Schema({
    owner: String,
    name: String,
    description: String,
    distance: Number,
    duration: Number,
    avgSpeed: Number,
    timeStamp: Date,
    trackPoints: []
});

var Track = mongoose.model('Track', track);

// connect
exports.connect = function(req,res){
    if(!mongoose.connection.readyState){
            mongoose.connect(connection_string,function(err,ok){
            if(err) {
                res.render('error', {message: 'Database connection failed', error: err});
            }
            else {
                console.log('connected to database');
            }                
        });
    }
    res.render('login', { title: 'Lenkit' });       
}

// register user
exports.register = function(req,res){
    
    console.log(req.body);
    
    if(req.body.password1 !== req.body.password2) {
        res.render('register',{title:'Lenkit', error:'Passwords do not match'});
        return;
    }
    
    var temp = new User();
    temp.username = req.body.username;
    temp.password = bcrypt.hashSync(req.body.password1, bcrypt.genSaltSync(8), null);
    //temp.password = req.body.password1;
    temp.email = req.body.email;
    temp.metric = true;
    
    temp.save(function(err){
        if(err){
            res.render('register',{title:'Lenkit', error:'Username already exists'});            
        }
        else{   
            // TODO: email confirmation
            req.session.username = temp.username;
            req.session.id = temp._id;
            res.redirect('/');
        }
    });
}

// login 
exports.logIn = function(req,res){
    
    // TODO: check password
    var password = req.body.password;
    
    User.find({username:req.body.username},function(err,user){
        if(err || user.length === 0){
            //console.log('error');
            res.render('login',{title:'Lenkit',error:'Wrong username or password'});
        }
        else{
            if(bcrypt.compareSync(password, user[0].password)) {
            //if(password === user[0].password) {
                req.session.username = user[0].username;
                req.session.id =  user[0]._id;
                //console.log('pw success ' + password + ' ' + user[0].password);
                res.redirect('/');
            }
            else {
                //console.log('pw fail ' + password + ' ' + user[0].password);
                res.render('login',{title:'Lenkit',error:'Wrong username or password'});
            }
        }
    });
}

// get tracks for user
exports.getTracks = function(req,res){  
    console.log('getTracks ' + req.session.username + ' ' + req.session.id);   
  
    Track.find({owner:req.session.username},function(err,data){
        if(err) {
            res.render('error', {message: 'Database error', error: err});
        }
        else {
            var index = req.query.track;
            var trackNames = [];
            var trackPts = [];
            var desc = '';
            var dist = 0;
            
            for(var i = 0; i < data.length; i++) {
                trackNames.push(data[i].name);
            }
            
            if(typeof index !== 'undefined' && index >= 0 && index < data.length) {
                if(typeof data[index] !== 'undefined'){
                    trackPts = data[index].trackPoints;
                    desc = data[index].description;
                    dist = data[index].distance;
                }  
            }
            res.render('index', { title: 'Lenkit',
                                      username:req.session.username,
                                      tracklist: trackNames,
                                      desc: desc,
                                      dist: dist,
                                      trackpoints: JSON.stringify(trackPts) }); 
        }
    });
}

// add new track
exports.addTrack = function(req,res){

    var temp = new Track({
        owner:req.session.username,
        name:'',
        description: '',
        distance: 0,
        duration: 0,
        avgSpeed: 0,
        trackPoints: [],
    });    
    
    var dist = 0;
    temp.timeStamp = new Date();

    //console.log(req.body);
    //console.log(req.files);
    // handle file
    var parser = new DOMParser();
    var xmldoc = parser.parseFromString(req.files.gpxfile.buffer.toString(), "text/xml");
    
    var gpx = xmldoc.getElementsByTagName("gpx");
    
    console.log('gpx: ' + gpx.length);
    if(gpx.length !== 1){
        res.render('error', {title: 'Lenkit', message: 'File upload failed.', error: {}});        
    }
    else {
        var points = xmldoc.getElementsByTagName("trkpt");

        var trackPts = [];
        temp.name = xmldoc.getElementsByTagName("time")[0].childNodes[0].nodeValue;

        if(typeof req.body.description !== 'undefined' || typeof req.body.description !== null)
            temp.description = req.body.description;
        else
            temp.description = '';

        for(i = 0; i < points.length; i++){	  
            var trkpt = { lat:String, lon:String, time:String };
            trkpt.lat = points[i].getAttribute("lat");
            trkpt.lon = points[i].getAttribute("lon");
            trkpt.time = '';      
            //console.log(trkpt);
            trackPts.push(trkpt);

            var gp1 = new GeoPoint(parseFloat(trackPts[i < 1 ? 0 : i - 1].lat),
                                   parseFloat(trackPts[i < 1 ? 0 : i - 1].lon));
            var gp2 = new GeoPoint(parseFloat(trackPts[i].lat), parseFloat(trackPts[i].lon));

            dist = dist + gp2.distanceTo(gp1, true);
        }

        //console.log(trackPts);
        //console.log(trackPts.length)
        temp.distance = dist.toFixed(2);
        temp.trackPoints = trackPts;
        temp.save(function(err){
            if(err){
                res.render('error', {title: 'Lenkit', message: 'Failed to save track', error: err});
            }
        });

        res.redirect('/');
    }
}