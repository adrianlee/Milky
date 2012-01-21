// Modules
var express = require('express'),
	mongoose = require('mongoose'),
    auth = require('everyauth'),
	graph = require('fbgraph'),
	jade = require('jade'),
	stylus = require('stylus');

var app = express.createServer();

auth.debug = true;

// Auth
auth.facebook
	.appId('172509826448')
	.appSecret('4821346f6d7d3f32d0af7b5eb29a6acf')
	.entryPath('/fb/auth')
	.scope('email,user_status')
	.findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
		// does smoething
	})
	.redirectPath('/');

auth.password
	.getLoginPath('/fb/login')
	.postLoginPath('/fb/login')
	.loginView('mongoose')
	.authenticate( function (login, password) {
		// something
	})
	.getRegisterPath('/fb/register')
	.postRegisterPath('/fb/register')
	.registerView('jsonp')
	.validateRegistration( function (newUserAttributes) {
		// something
	})
	.registerUser( function (newUserAttributes) {
		//something
	})
	.loginSuccessRedirect('/')
	.registerSuccessRedirect('/');

// Configuration
app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { layout: true });
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(stylus.middleware({ src: __dirname + '/public'}));
	app.use(express.static(__dirname + '/public'));
    app.use(auth.middleware());
    app.use(express.session({ secret: 'asdasdasd'}));
    app.use(express.cookieParser());
});

app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});


// Routers
app.get('/', function(req, res) {
	res.render('index', { title: 'Home' });
	console.log('GET: index.jade');
});

app.get('/fb', function(req, res) {
	res.render('fb', { title: 'Facebook'});
	console.log('GET: fb.jade');
});

app.get('/fb/auth', function(req, res) {
	if (!req.query.code) {
		var authUrl = graph.getOauthUrl ({
			'client_id': '172509826448',
			'redirect_uri': 'http://local.host:3000/fb/auth'
		});

		if (!req.query.error) {
			res.redirect(authUrl);
		} else {
			res.send('access denied');
		}
		return;
	}
});

app.get('/jsonp', function(req, res) {
	res.render('jsonp', { title: 'JSONP'});
	console.log('GET: jsonp.jade');
});

app.get('/mongoose', function(req, res) {
	res.render('mongoose', { title: 'MONGOOSE'});
	console.log('GET: mongoose.jade');
});

var port = 3000;
app.listen(port);
console.log('Server listening on port ' + port);
