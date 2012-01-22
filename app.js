// Modules
var express = require('express'),
	mongoose = require('mongoose'),
    auth = require('everyauth'),
	graph = require('fbgraph'),
	jade = require('jade'),
	stylus = require('stylus');

var app = express.createServer();

var config = require('./config');

// Configuration
app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { layout: true });
	app.use(express.bodyParser());
    app.use(express.cookieParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(stylus.middleware({ src: __dirname + '/public'}));
	app.use(express.static(__dirname + '/public'));
    app.use(express.session({ secret: 'asdasdasd'}));
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
			'client_id': config.fb.appId,
			'redirect_uri': config.fb.redirect_uri
		});

		if (!req.query.error) {
			res.redirect(authUrl);
		} else {
			res.send('access denied');
		}
		return;
	}

	graph.authorize({
		'client_id': config.fb.appId,
		'client_secret': config.fb.appSecret,
		'redirect_uri': config.fb.redirect_uri,
		'code': req.query.code
	}, function (err, facebookRes) {
		res.redirect('/');
		console.log(graph.getAccessToken());
	});
});

app.get('/fb/logout', function(req, res) {
	res.redirect('https://www.facebook.com/logout.php?next=' + config.fb.redirect_uri + '&access_token=' + graph.getAccessToken());
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
