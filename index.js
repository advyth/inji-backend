const express = require('express');
const app = express();
const port = 5000;
var mysql = require('mysql');
var cors = require('cors');
var bodyParser = require('body-parser');

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
	connection.query(login_query, function(err, result){
		if(result.length > 0)
		{
			res.send("Success");
		}
		else
		{
			res.send("Failed");
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
  connection.query(new_user_query, function(err, result){
    if(err) throw err;
    res.send("Registered");
    console.log("Row inserted");
  })
});



app.listen(port, ()=> console.log("Listening on port 5000"));

//mysql://b2974b50757180:6545ca82@us-cdbr-iron-east-03.cleardb.net/heroku_90095f85482d913?reconnect=true