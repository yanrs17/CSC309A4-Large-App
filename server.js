var http = require("http");
var fs = require("fs");
var express = require("express");
var app = express();
var expressValidator = require("express-validator");
var bodyParser = require('body-parser');
var expressSession = require("express-session");
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcryptjs');
var path = require('path');
var session = require('express-session')

/*
	this is a list of url to save url which we
	might receive request later
*/
var url_list = ['/', '/index.html'];
var db = new sqlite3.Database('db.sqlite');
db.serialize();

app.use(express.static(__dirname + '/assets'));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


app.use(expressValidator({
	customValidators: {
		isUserName: function(value) {
			var reg = /^[0-9A-Za-z_]{1,32}$/;

			return String(value).search(reg) >= 0;
		},

		isPassword: function(value) {
			var reg = /^[a-zA-Z0-9]{8,32}$/;
			return String(value).search(reg) >= 0;

		},

		isSamePwd: function(value) {
			//not implemented yet
		}
	}
}));

app.get(url_list[0] || url_list[1], function(req, res) {
    res.render('index', {  // Note that .html is assumed.
        "errors": ''
    });

//	res.sendFile(__dirname + '/index.html');
});



app.post('/signup', function(req, res)
{
	req.assert('uname', 'Username is required').notEmpty();
	req.assert('pword', 'Password is required').notEmpty();

	req.checkBody('uname', 'Username is not valid').isUserName();
	req.checkBody('pword', 'Password is not valid').isPassword();
    req.check('confirm', 'password is not matched').equals(req.body.pword);

	var err = req.validationErrors();
    var mappedErrors = req.validationErrors(true);

    if (err) // If errors exist, send them back to the form:
    {
        var msgs = { "errors": {} };


        if ( mappedErrors.uname )
            msgs.errors.error_uname = mappedErrors.uname.msg;

        if ( mappedErrors.pword )
            msgs.errors.error_pword = mappedErrors.pword.msg;

        if ( mappedErrors.confirm)
            msgs.errors.error_confirm = mappedErrors.confirm.msg;

        // res.sendFile(__dirname + '/index.html');
        res.render('index', msgs);
        res.redirect(__dirname + '/signup');

    } else {
		//submit the data to database
		console.log("signup");
	}
});


app.post('/signin', function(req, res)
{
	req.assert('username', 'Username is required').notEmpty();
	req.assert('password', 'Password is required').notEmpty();


	req.checkBody('username', 'Username is not valid').isUserName();
	req.checkBody('password', 'Password is not valid').isPassword();



	var err = req.validationErrors();
    var mappedErrors = req.validationErrors(true);

    if (err) // If errors exist, send them back to the form:
    {
        var msgs = { "errors": {} };


        if ( mappedErrors.username )
            msgs.errors.error_username = mappedErrors.username.msg;

        if ( mappedErrors.password )
            msgs.errors.error_password = mappedErrors.password.msg;


        // res.sendFile(__dirname + '/index.html');
        res.render('index', msgs);

    } else {
		//submit the data to database
        var username = req.body.username;
        db.all("SELECT email, password, is_admin FROM users WHERE email = '" + username + "'", function(err, rows) {
            if (err) {
                throw err;
            }
            if(!rows || rows.length > 1) {
                throw "this shouldn't happen";
            }

            if (rows.length === 1 && req.body.password === rows[0].password) {
                console.log("do something");
            }
        })
	}
});

var server = app.listen(3000, function()
{
  var port = server.address().port;
  console.log('Running on 127.0.0.1:%s', port);
});
