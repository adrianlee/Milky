// Modules
var express = require('express'),
    everyauth = require('everyauth'),
    graph = require('fbgraph'),
    jade = require('jade'),
    stylus = require('stylus'),
    config = require('./config');

var usersById = {};
var usersByFbId = {};
var nextUserId = 0;

// User functions
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

// Graph

// App & Configuration
var app = express.createServer();

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'asdasdasd'}));
    
    app.use(everyauth.middleware());
    app.use(app.router);

    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    app.set('view options', { layout: true });
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
    console.log('GET: index.jade');
    res.render('index', { title: 'Home' });
});

app.get('/fb', function (req, res) {
    console.log('GET: fb.jade');
    if (req.session.auth && req.session.auth.loggedIn) {
        console.log("graph accessToken Set: " + req.session.auth.facebook.accessToken);
        graph.setAccessToken(req.session.auth.facebook.accessToken);
    }
    res.render('fb', { title: 'Facebook' });
});

app.get('/jsonp', function (req, res) {
    console.log('GET: jsonp.jade');
    res.render('jsonp', { title: 'JSONP'});
});

app.get('/mongoose', function (req, res) {
    console.log('GET: mongoose.jade');
    res.render('mongoose', { title: 'MONGOOSE'});
});

app.get('/private', function (req, res) {
    //console.log(req.session);
    if (req.session.auth && req.session.auth.loggedIn) {
        res.render('private', {title: 'Protected'});
    } else {
        console.log("The user is NOT logged in");
        //console.log(req.session);
        res.redirect('/fb');
    }
});

var port = 3000;
app.listen(port);
console.log('Server listening on port ' + port);
