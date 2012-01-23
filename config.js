module.exports = {
    fb: {
	appId: process.env.appId,
	appSecret: process.env.appSecret,
	scope: 'email, user_about_me, user_birthday, user_location, publish_stream',
	redirect_uri: 'http://lemonsweat.local:3000/auth/facebook/callback/'
    }
};
