// Modules
var express = require('express'),
	//mongoose = require('mongoose'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
	//util = require('util'),
	jade = require('jade'),
	stylus = require('stylus');


var config = require('./config');

// Passport
passport.use(new FacebookStrategy({
	clientID: config.fb.appId,
	clientSecret: config.fb.appSecret,
	callbackURL: config.fb.redirect_uri
	},
	function (accessToken, refreshToken, profile, done) {
		// User.findOrCreate({ facebookId: profile.id }, function (err, user) {
		// 	return done(err, user);
		// });
		process.nextTick(function () {
			console.log(accessToken);
			return done(null, profile);
		});
	})
);

var app = express.createServer();

// Configuration
app.configure(function () {
	app.use(express.bodyParser());
    app.use(express.cookieParser());
	app.use(express.methodOverride());
    app.use(express.session({ secret: 'asdasdasd'}));
    
    app.use(passport.initialize());
    app.use(passport.session());
	app.use(app.router);

	app.use(express.static(__dirname + '/public'));
	app.set('view engine', 'jade');
	app.set('views', __dirname + '/views');
	app.set('view options', { layout: true });
	app.use(stylus.middleware({ src: __dirname + '/public'}));
});

app.configure('development', function () {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
});

app.configure('production', function () {
	app.use(express.errorHandler());
});

// Routers
app.get('/', function (req, res) {
	res.render('index', { title: 'Home' });
	console.log('GET: index.jade');
});

app.get('/fb', function (req, res) {
	res.render('fb', { title: 'Facebook'});
	console.log('GET: fb.jade');
});

app.get('/jsonp', function (req, res) {
	res.render('jsonp', { title: 'JSONP'});
	console.log('GET: jsonp.jade');
});

app.get('/mongoose', function (req, res) {
	res.render('mongoose', { title: 'MONGOOSE'});
	console.log('GET: mongoose.jade');
});

// app.post('/login', passport.authenticate('local'), function(req, res) {
// 	// if this function gets called, authentication was successful.
// 	// 'req.user' property contains the authenticated user.
// });

app.get('/auth/facebook', 
	passport.authenticate('facebook', { scope: ['user_status', 'user_photos'] }),
	function ( req, res ) {
		console.log(req);
		console.log(res);
	}
);

app.get('/auth/facebook/callback',
	passport.authenticate('facebook', { failureRedirect: '/login' } ),
	function (req, res) {
		res.redirect('/');
	}
);

app.get('/logout', function (req, res) {
	console.log('GET: /logout');
	req.logout();
	res.redirect('/');
});


var port = 3000;
app.listen(port);
console.log('Server listening on port ' + port);
