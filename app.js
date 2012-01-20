// Modules
var express = require('express'),
	mongoose = require('mongoose'),
        auth = require('everyauth'),
	graph = require('fbgraph'),
	jade = require('jade'),
	stylus = require('stylus');

var app = express.createServer();

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

var port = 3000;
app.listen(port);
console.log('Server listening on port ' + port);
