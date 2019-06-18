const bcrypt = require('bcryptjs');
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
	host : "",
	user : "",
	password : "",
	database : "",
});

var mysqlPool = mysql.createPool({
	connectionLimit : 100,
	host : "",
	user : "",
	password : "",
	database : "",
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
	var login_query = sqlClean.format("select * from users where email=? ",email);
	var auth = [];
	mysqlPool.query(login_query, function(err, result){
	;
		if(email == "admin" && password == "admin")
		{
			res.send("admin");
		}
		else if((result.length > 0) && (bcrypt.compareSync(password, result[0].password)))
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
	var passwordHash;
	var salt = bcrypt.genSaltSync(saltRounds);
	var hash = bcrypt.hashSync(password, salt);
	console.log(hash);
  var new_user_query = sqlClean.format("insert into users values(?,?,?)",[email, username, hash]);
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
	var moviename = req.body.moviename;
	var director = req.body.director;
	var genre = req.body.genre;
	var actor = req.body.actor;
	var rating = req.body.rating;
	var synopsis = req.body.synopsis;
	var tags = req.body.tags;
	var url = req.body.url;
	var movie_add_query = sqlClean.format("insert into movie_list values(?,?,?,?,?,?,?,?,?,?)",[moviename, director, genre, actor, rating, url, unid(), synopsis, tags,100]);
	mysqlPool.query(movie_add_query, function(err,result){
		if(err) throw err;
		res.send("Added 1 row");
	});
});

app.post('/api/get/movies', function(req, res){
	console.log("Send movie request recieved");
	var auth = req.body.auth;
	if(auth)
	{
		var movie_get_query = "select * from movie_list order by rating limit 5";
		mysqlPool.query(movie_get_query, function(err, result){
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
		var single_movie_query = sqlClean.format("Select * from movie_list where id=?", id);
		mysqlPool.query(single_movie_query, function(err, result){
			if(err) throw err;
			res.send(result);
		});
	}

});

app.post('/api/review/rate', function(req, res){
	var review_id = req.body.review_id;
	var type = req.body.review_type;
	var id = req.body.id;
	var email = req.body.email;
	//check if already rated
	//


			var check_if_user_review = sqlClean.format("select * from reviews where email=? and review_id=?", [email,review_id]);
			console.log(email +" "+ id + " "+ review_id);
			mysqlPool.query(check_if_user_review, function(err, result)
			{
				var duplication = sqlClean.format("select * from review_rating where email=? and review_id=?", [email, review_id])
				mysqlPool.query(duplication, function(err, result){
					if(result.length == 0)
					{
						if(result.length == 0)
				{
					if(type=="like")
					{
						var rating_query = sqlClean.format("update reviews set likes = (likes + 1) where review_id=?", review_id);
					}
					else
					{
						var rating_query = sqlClean.format("update reviews set dislikes = (dislikes + 1) where review_id=?", review_id);
					}
					mysqlPool.query(rating_query, function(err, result){
						if(err) throw err;
						var add_rating = sqlClean.format("insert into review_rating values(?,?,?,?)",[type, review_id, id, email]);
						mysqlPool.query(add_rating,function(err, result){
							if(err) throw err;
							res.send("Rated");
						})
					})
				}
					}
				})
				
		
			});
			

});
app.post('/api/all', function(req, res){
	var all_query = sqlClean.format("select * from movie_list");
	mysqlPool.query(all_query, function(err, result)
	{
		if(err) throw err;
		res.send(result);
	})
});
app.post('/api/add/review', function(req, res){
	console.log("Review add request recieved");
	var id = req.body.id;
	var review = req.body.review;
	var rating = req.body.rating;
	var username = req.body.username;
	var email = req.body.email;
	var same_user_check_query = sqlClean.format("select * from reviews where username=? and id=? ", [username, id]);
	var score = [];
	score[1] = 0;
	score[2] = 25;
	score[3] = 50;
	score[4] = 75;
	score[5] = 100;

	var addMovieScore = sqlClean.format("update movie_list set rating = (rating + ?)/2 where id = ?", [score[rating], id]);
	mysqlPool.query(addMovieScore, function(err, result){
		if(err) throw err;
		console.log("Score added");
	});
	mysqlPool.query()
	mysqlPool.query(same_user_check_query, function(err,result){
		console.log(result.length);
		console.log("Hit!");
		if(result.length != 0)
		{
			res.send("user_duplicate");
		}
		else
		{
			if(req.body.kid_friendly == 1)
			{
				var kid_rating_query = sqlClean.format("update movie_list set kid_friendly = (kid_friendly+100)/2 where id=?", id);
				mysqlPool.query(kid_rating_query, function(err, result){
					if(err) throw err;
					var review_add_query = sqlClean.format("insert into reviews values(?,?,?,?,?,?,?,?)",[username,review, rating, email,id, unid(), 0, 0]);
					mysqlPool.query(review_add_query, function(err, result){
						if(err) throw err;
						res.send("Added");
					});
				});
			}
			else
			{
				var kid_rating_query = sqlClean.format("update movie_list set kid_friendly=(kid_friendly+0)/2 where id=?",id);
				mysqlPool.query(kid_rating_query, function(err, result){
					if(err) throw err;
					var review_add_query = sqlClean.format("insert into reviews values(?,?,?,?,?,?,?,?)",[username,review, rating,email, id, unid(), 0, 0]);
					mysqlPool.query(review_add_query, function(err, result){
						if(err) throw err;
						res.send("Added");
					});
							
				});
			}
			
		}
	});
	

});

app.post('/api/get/reviews', function(req, res){
	var id = req.body.id;
	var email = req.body.email;
	var get_review_query = sqlClean.format("select * from reviews where id=?",id);
	var reviews = [];
	mysqlPool.query(get_review_query, function(err, result){
		if(err) throw err;
		res.send(result);
	});
});

app.post('/api/search/movie',function(req,res){
	var movie = req.body.movie ;
	console.log("Search request for "+ movie+" recieved");
	var search_query = "select * from movie_list where name like '%"+movie+"%' ";
	mysqlPool.query(search_query, function(err, result){
		if(err) throw err;
		if(result[0] == undefined)
		{
			res.send("empty");
			console.log("Hit");
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
	var search_query = "select name, id from movie_list where name like '%"+movie+"%' limit 7";
	mysqlPool.query(search_query, function(err, result){
		if(err) throw err;
		res.send(result);
	});

});
//Keep the connection alive




app.listen(port, ()=> console.log("Server has started and is ready for those requests :)"));

