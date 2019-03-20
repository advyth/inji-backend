const express = require('express');
const app = express();
const port = 3001;
var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'us-cdbr-iron-east-03.cleardb.net',
	user : 'b2974b50757180',
	password : '6545ca82',
	database : 'heroku_90095f85482d913',
});

connection.connect(function(err) {
  if (err) throw err
  console.log('Connected to MySQL database')
})

app.get('/', (req,res)=>res.send("<h1>Page hit</h1>"));

app.listen(port, ()=> console.log("Listening on port 3001"));

//mysql://b2974b50757180:6545ca82@us-cdbr-iron-east-03.cleardb.net/heroku_90095f85482d913?reconnect=true