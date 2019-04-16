const express = require('express');
const app = express();
const port = process.env.PORT || 5000; //The port that the server serves from.
var mysql = require('mysql'); //MySQL middleware
var cors = require('cors'); //For handling CORS requests.
var bodyParser = require('body-parser'); //Library for parsing POST requests.
var unid = require('uniqid'); //Library for generating unique ID's.
var sqlClean = require('sqlstring'); //Library for dealing with SQL injection.



//Create the connection

var connection = mysql.createConnection({
	host : 'us-cdbr-iron-east-03.cleardb.net',
	user : 'b2974b50757180',
	password : '6545ca82',
	database : 'heroku_90095f85482d913',
});

var mysqlPool = mysql.createPool({
	connectionLimit : 100,
	host : 'us-cdbr-iron-east-03.cleardb.net',
	user : 'b2974b50757180',
	password : '6545ca82',
	database : 'heroku_90095f85482d913',
	debug : false,
});


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
//Handle login
app.post('/login', function(req,res){
	var email = req.body.email;
	var password = req.body.password;
	console.log("email "+ email + " password "+password);
	var login_query = sqlClean.format("select * from users where email=? and password=?",[email,password]);
	var auth = [];
	mysqlPool.query(login_query, function(err, result){
		if(result.length > 0)
		{
			auth.push(result[0].username);
			auth.push("Success");
			res.send(auth);
		}
		else
		{
			auth.push(null);
			auth.push("Failed");
			res.send(auth);
		}
	});
});

//Handle register
app.post('/register', function(req,res){
  console.log("Register request recieved");
  var username = req.body.username;
  var password = req.body.password;
	var email = req.body.email;
	const saltRounds = 10;
  var new_user_query = sqlClean.format("insert into users values(?,?,?)",[email, username, password]);
  var check_query = "select * from users where email='"+email+"'";
  mysqlPool.query(check_query, function(err, result){
    if(err) throw err;
    if(result.length == 0)
    {
    	connection.query(new_user_query, function(err, result){
    		res.send("Registered");
    		console.log("Row inserted");
    	});
    }
    else
    {
    	res.send("Exists");
    }
    
  })
});

app.post('/admin/add', function(req,res){
	console.log("Add movie response recieved");
	var moviename = sqlClean.escape(req.body.moviename);
	var director = sqlClean.escape(req.body.director);
	var genre = sqlClean.escape(req.body.genre);
	var actor = sqlClean.escape(req.body.actor);
	var rating = sqlClean.escape(req.body.rating);
	var url = sqlClean.escape(req.body.url);
	var movie_add_query = sqlClean.format("insert into movie_list values(?,?,?,?,?,?,?)",[moviename, director, genre, actor, rating, url, unid()]);
	mysqlPool.query(movie_add_query, function(err,result){
		if(err) throw err;
		res.send("Added 1 row");
	});
});

app.post('/api/get/movies', function(req, res){
	console.log("Send movie request recieved");
	var auth = sqlClean.escape(req.body.auth);
	if(auth)
	{
		var movie_get_query = "select * from movie_list";
		mysqlPool.query(movie_get_query, function(err, result){
			if(err) throw err;
			res.send(result);
		});

	}
});
app.post('/api/get/single/movie', function(req, res){
	console.log("Single movie request recieved");
	var auth = sqlClean.escape(req.body.auth);
	if(auth)
	{	var id = req.body.id;
		var single_movie_query = sqlClean.format("Select * from movie_list where id=?", id);
		mysqlPool.query(single_movie_query, function(err, result){
			if(err) throw err;
			res.send(result);
		});
	}

});
app.post('/api/add/review', function(req, res){
	console.log("Review add request reciever");
	var id = sqlClean.escape(req.body.id);
	var review = sqlClean.escape(req.body.review);
	var rating = sqlClean.escape(req.body.rating);
	var username = sqlClean.escape(req.body.username);
	var same_user_check_query = sqlClean.format("select * from reviews where username=?", username);
	mysqlPool.query(same_user_check_query, function(err,result){
		console.log(result.length);
		console.log("Hit!");
		if(result.length != 0)
		{
			res.send("user_duplicate");
		}
		else
		{
			var review_add_query = sqlClean.format("insert into reviews values(?,?,?,?)",[username,review, rating, id]);
			mysqlPool.query(review_add_query, function(err, result){
				if(err) throw err;
				res.send("Added");
			});
		}
	});
	

});

app.post('/api/get/reviews', function(req, res){
	var id = req.body.id;
	var get_review_query = sqlClean.format("select * from reviews where id=?",id);
	mysqlPool.query(get_review_query, function(err, result){
		if(err) throw err;
		res.send(result);
	});
});

app.post('/api/search/movie',function(req,res){
	var movie = req.body.movie ;
	console.log("Search request for "+ movie+" recieved");
	var search_query = "select * from movie_list where name like '%+"+movie+"+%' ";
	mysqlPool.query(search_query, function(err, result){
		if(err) throw err;
		if(result[0] == undefined)
		{
			res.send("empty");
		}
		else
		{
			console.log(result[0].name);
			res.send(result);
		}
		
	})
});
app.post('/api/autocomplete/', function(req, res){
	var movie = req.body.search;
	var search_query = "select name, id from movie_list where name like '%"+movie+"%'";
	mysqlPool.query(search_query, function(err, result){
		if(err) throw err;
		res.send(result);
	});

});
//Keep the connection alive




app.listen(port, ()=> console.log("Server has started and is ready for those requests :)"));

//mysql://b2974b50757180:6545ca82@us-cdbr-iron-east-03.cleardb.net/heroku_90095f85482d913?reconnect=true
//6545ca82