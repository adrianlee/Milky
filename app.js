// Modules
var express = require('express'),
	everyauth = require('everyauth'),
	fbgraph = require('fbgraph'),
	//mongoose = require('mongoose'),
	//util = require('util'),
	jade = require('jade'),
	stylus = require('stylus'),
	config = require('./config');


var usersById = {};
var usersByFbId = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

// Everyauth
everyauth.debug = true;

everyauth.facebook
	.appId(config.fb.appId)
	.appSecret(config.fb.appSecret)
	//.entryPath('/auth/facebook')
	//.callbackPath('/auth/facebook/callback')
	//.scope('email')
	.findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
		return usersByFbId[fbUserMetadata] || (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
	})
	.logoutPath('/fb/logout')
	.logoutRedirectPath('/fb')
	.redirectPath('/fb');

// App & Configuration
var app = express.createServer();

app.configure(function () {
	app.set('view engine', 'jade');
	app.set('views', __dirname + '/views');
	app.set('view options', { layout: true });
	app.use(express.bodyParser());
    app.use(express.cookieParser());
	app.use(express.methodOverride());
    app.use(express.session({ secret: 'asdasdasd'}));
    
    app.use(everyauth.middleware());
	app.use(app.router);

	app.use(express.static(__dirname + '/public'));
	app.use(stylus.middleware({ src: __dirname + '/public'}));
	everyauth.helpExpress(app);
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

app.get('/private', function (req, res) {
	//console.log(req.session);
	if (req.session.auth && req.session.auth.loggedIn) {
		res.render('private', {title: 'Protected'});
	} else {
		console.log("The user is NOT logged in");
		console.log(req.session);
		res.redirect('/fb');
	}
});


var port = 3000;
app.listen(port);
console.log('Server listening on port ' + port);
