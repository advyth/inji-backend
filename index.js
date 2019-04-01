const express = require('express');
const app = express();
const port = 5000; //The port that the server serves from.
var mysql = require('mysql'); //MySQL middleware
var cors = require('cors'); //For handling CORS requests.
var bodyParser = require('body-parser'); //Library for parsing POST requests.
var unid = require('uniqid'); //Library for generating unique ID's.


//Create the connection

var connection = mysql.createConnection({
	host : 'us-cdbr-iron-east-03.cleardb.net',
	user : 'b2974b50757180',
	password : '6545ca82',
	database : 'heroku_90095f85482d913',
});


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Handle login
app.post('/login', function(req,res){
	var email = req.body.email;
	var password = req.body.password;
	console.log("email "+ email + " password "+password);
	//var login_query = 'select * from users';
	var login_query = "select * from users where email='"+email+"' and password='"+password+"'";
	var auth = [];
	connection.query(login_query, function(err, result){
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
  var new_user_query = "insert into users values('"+email+"','"+username+"','"+password+"')";
  var check_query = "select * from users where email='"+email+"'";
  connection.query(check_query, function(err, result){
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
	var moviename = req.body.moviename;
	var director = req.body.director;
	var genre = req.body.genre;
	var actor = req.body.actor;
	var rating = req.body.rating;
	var url = req.body.url;
	var movie_add_query = "insert into movie_list values('"+moviename+"','"+director+"','"+genre+"','"+actor+"',"+rating+",'"+url+"',"+unid()+")";
	connection.query(movie_add_query, function(err,result){
		if(err) throw err;
		res.send("Added 1 row");
	});
});

app.post('/api/get/movies', function(req, res){
	console.log("Send movie request recieved");
	var auth = req.body.auth;
	if(auth)
	{
		var movie_get_query = "select * from movie_list";
		connection.query(movie_get_query, function(err, result){
			if(err) throw err;
			res.send(result);
		});

	}
});
app.post('/api/get/single/movie', function(req, res){
	console.log("Single movie request recieved");
	var auth = req.body.auth;
	if(auth)
	{	var id = req.body.id;
		var single_movie_query = "Select * from movie_list where id='"+id+"'";
		connection.query(single_movie_query, function(err, result){
			if(err) throw err;
			res.send(result);
		});
	}

});
app.post('/api/add/review', function(req, res){
	console.log("Review add request reciever");
	var id = req.body.id;
	var review = req.body.review;
	var rating = req.body.rating;
	var username = req.body.username;
	var review_add_query = "insert into reviews values('"+username+"','"+review+"',"+rating+",'"+id+"')";
	connection.query(review_add_query, function(err, result){
		if(err) throw err;
		res.send("Added");
	});

});

app.post('/api/get/reviews', function(req, res){
	var id = req.body.id;
	var get_review_query = "select * from reviews where id='"+id+"'";
	connection.query(get_review_query, function(err, result){
		if(err) throw err;
		res.send(result);
	});
});

app.post('/api/search/movie',function(req,res){
	var movie = req.body.movie;
	console.log("Search request for "+ movie+" recieved");
	var search_query = "select * from movie_list where name like '%"+movie+"%'";
	connection.query(search_query, function(err, result){
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
	connection.query(search_query, function(err, result){
		if(err) throw err;
		res.send(result);
	});

});
//Keep the connection alive

setInterval(()=>{
	connection.query('SELECT 1',(err, result)=>{
		
	});
},5000);



app.listen(port, ()=> console.log("Listening on port 5000"));

//mysql://b2974b50757180:6545ca82@us-cdbr-iron-east-03.cleardb.net/heroku_90095f85482d913?reconnect=true
//6545ca82