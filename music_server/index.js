const express = require('express')
const app = express()
const sqlite3 = require("sqlite3")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

var bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const client_id = process.env.NODE_CLIENT_ID
const client_secret = process.env.NODE_CLIENT_SECRET

var cookie_secret = "fortniteamongus";

app.use(cors());
app.use(bodyParser.json());

//app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

//db.run("CREATE DATABASE test;")
//let db = new sqlite3.Database(':memory:');
let db
db = new sqlite3.Database('./test.db', (err)=>{
	if(err){
		console.log("creating database")
		db = new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE)
	}
})

db.run(`CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
	  spotify_id INTEGER(255), 
	  total_rating INTEGER(255),
	  num_ratings INTEGER(255));`, (err)=>{
		if(err){
			console.log(err);
			console.log("post table already made")
		}
	})
db.run(`CREATE TABLE passwords (
    id INTEGER PRIMARY KEY,
	username CHAR(255), 
	password CHAR(255));`, (err)=>{
		if(err){
			console.log(err);
			console.log("password table already made")
		}
	})


function authenticate_token(token, username){
	if(token === undefined || username === undefined){
		console.log("unidentified log in")
		return false;
	}
	let rtrn_value = false
	console.log("token before verify", token)
	jwt.verify(token, cookie_secret, (err, username_result) => {
		console.log("usrename and result", username, username_result)
   	if(err){
   		console.log(err)
   		rtrn_value = false
    }else if(username == username_result.username){
			console.log("valid acess in auth function")
			rtrn_value = true;
		}else{
			console.log("invalid cookie or secret")
			rtrn_value = false
		}
	})
	return rtrn_value
}

async function getAcessToken(){
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: client_id,
      client_secret: client_secret
    }),
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  });
  const result_json = await result.json()
  if(result_json.error == undefined){
    //alert("acess token: " + result_json.access_token)
    return result_json.access_token;
  }else{
    alert("error with getting acess token, try again later")
    return "error";
  }
}

function getquery(query){
	return new Promise((resolve, reject)=>{
		db.get(query, (err, row)=>{
			console.log("row from getquery: " + row)
			console.log("query: " + query)
			return resolve(row);
	   });
	});
}

async function getSearchTerm(search_term, limit, offset, username){
	const result = await fetch('https://api.spotify.com/v1/search?q=track%3A' + search_term+ '&type=track&limit=' + limit + "&offset=" + offset, {
	  headers: {
	    'Authorization': 'Bearer ' + access_token
	  }
	});
	const result_json = await result.json()
  if(result_json.error == undefined){
    //alert("acess token: " + result_json.access_token)
    var arr = result_json.tracks.items
    var return_arr = []
    for(var i = 0; i < arr.length; i++){
    	var artist_arr = []
    	for(var j = 0; j < arr[i].artists.length; j++){
    		artist_arr.push(arr[i].artists[j].name);
    	}
    	var query = "SELECT total_rating, num_ratings FROM posts WHERE spotify_id = '" + arr[i].id + "';"
    	var row = await getquery(query);
    	var score;
			if(row === undefined){
				score = "N/A";
			}else{
				score = row.total_rating/row.num_ratings;
			}

			var user_score;
			if(username === undefined){
				user_score = "N/A"
			}else{
				var user_query = "SELECT user_rating FROM " + username + " WHERE spotify_id = '" + arr[i].id + "';"
				console.log(user_query)
	    	var user_row = await getquery(user_query);
	    	
				if(user_row === undefined){
					user_score = "N/A";
				}else{
					user_score = user_row.user_rating;
				}
			}
		
    	return_arr.push({name: arr[i].name, artists: artist_arr, id: arr[i].id, score: score, user_score: user_score, url: arr[i].album.images[0].url, spotify_url: arr[i].external_urls.spotify})
  	}
  	console.log({array: return_arr, next: result_json.tracks.next, offset: result_json.tracks.offset});
    return {array: return_arr, next: result_json.tracks.next, offset: result_json.tracks.offset};
  }else{
    console.log("error with search terms, try again later")
    console.log("error code " + result_json.error.status)
    if(result_json.error.status == 401){
    	console.log("reauthenticating user");
	    getAcessToken().then((response)=>{
				access_token = response;
				console.log(access_token)
			});
	    return getSearchTerm(search_term, limit, offset, username);
  	}
  }

}

async function updatePost(spotify_id, rating_score, username){
	var query = "SELECT COUNT(1) FROM posts WHERE spotify_id = '" + spotify_id + "';"
	var val = await getquery(query);
	console.log(val['COUNT(1)']);
	if(val['COUNT(1)'] == 0){//new entry
		console.log(spotify_id  + " does not already exist")
		db.run(`INSERT INTO posts (spotify_id, total_rating, num_ratings)
		 	VALUES (?, ?, ?);`, 
		 	[spotify_id, rating_score, 1],  
		 	(err)=>{
			 	if(err){
			 		console.log(err)
			 	}
		})
	}else{//update entry
		var count_query = "SELECT COUNT(1) FROM " + username + " WHERE spotify_id = '" + spotify_id + "';"
		var count_val = await getquery(count_query);
		if(count_val['COUNT(1)'] == 0){//new entry
			console.log("UPDATE posts SET total_rating = total_rating + " + rating_score + " WHERE spotify_id = '" + spotify_id + "';")
			db.run("UPDATE posts SET total_rating = total_rating + " + rating_score + ", num_ratings = num_ratings + 1 WHERE spotify_id = '" + spotify_id + "';",  
			 	(err)=>{
				 	if(err){
				 		console.log(err)
				 	}
			})
		}else{
			var user_rating_query = "SELECT user_rating FROM " + username + " WHERE spotify_id = '" + spotify_id + "';";
			var user_rating_val = await getquery(user_rating_query);
			console.log("user_rating_val: " + user_rating_val)
			console.log(user_rating_query);
			var old_rating = user_rating_val.user_rating
			console.log("old user rating " + old_rating + " new user rating " + rating_score)

			console.log(spotify_id  + " updating entry")
			console.log("UPDATE posts SET total_rating = total_rating + " + rating_score + " - " + old_rating + " WHERE spotify_id = '" + spotify_id + "';")
			db.run("UPDATE posts SET total_rating = total_rating + " + rating_score + " - " + old_rating + " WHERE spotify_id = '" + spotify_id + "';",  
			 	(err)=>{
				 	if(err){
				 		console.log(err)
				 	}
			})
		}
	}	
	var newrow = await getquery("SELECT total_rating, num_ratings FROM posts WHERE spotify_id = '" + spotify_id  + "';");
	var newscore = newrow.total_rating/newrow.num_ratings
	console.log("new score: " + newscore)
	return {error: false, sucess: true, score: newscore};
}
async function update_user_rating(spotify_id, username, rating_score){
	var query = "SELECT COUNT(1) FROM " + username + " WHERE spotify_id = '" + spotify_id + "';"
	var val = await getquery(query);
	if(val['COUNT(1)'] == 0){//new entry
		console.log(spotify_id  + " does not already exist")
		db.run(`INSERT INTO ${username} (spotify_id, user_rating)
		 	VALUES (?, ?);`, 
		 	[spotify_id, rating_score],  
		 	(err)=>{
			 	if(err){
			 		console.log(err)
			 	}
		})
	}else{//update entry
			console.log(spotify_id  + " updating entry")
			db.run("UPDATE " + username + " SET user_rating = " + rating_score + " WHERE spotify_id = '" + spotify_id + "';",  
			 	(err)=>{
				 	if(err){
				 		console.log(err)
				 	}
			})
	}
	return {error: false, sucess: true};
}

let access_token;

getAcessToken().then((response)=>{
	access_token = response;
	console.log(access_token)
});


app.get('/message', (req, res) => {
  const data = { message: 'server is working' };
  res.json(data);
});
app.post('/echo', (req, res) => {7
  const data = { message: req.body.message };
  console.log("server echoing message: " + req.body.message);
  res.json(data);
});

app.post("/register", (req, res, next) =>{
	console.log(`username:${req.body.username} password:${req.body.password}`)
	bcrypt.hash(req.body.password, 10).then(hashed =>{
		console.log(hashed)

		let query = "SELECT COUNT(1) FROM passwords WHERE username = '" + req.body.username + "';"
		db.get(query, (err, val)=>{
			if (err){
				console.log("error");
				res.json({error: true, duplicate_name: false, registered: false});
			}else if(val['COUNT(1)'] == 0){
				console.log(req.body.username + " does not already exist")
				db.run(`INSERT INTO passwords (username, password)
				 	VALUES (?, ?);`, 
				 	[req.body.username, hashed],  
				 	(err)=>{
				 	if(err){
				 		console.log(err)
				 	}
				})
				res.json({error: false, duplicate_name: false, registered: true});
			}else{
				res.json({error: false, duplicate_name: true, registered: false});
			}	
		})
	})
})

app.post("/login", bodyParser.json(), (req, res, next) =>{
	console.log(req.body);
	console.log(`username:${req.body.username} password:${req.body.password}`)
	
	let query = "SELECT password FROM passwords WHERE username = '" + req.body.username + "';"
	db.get(query, (err, val)=>{
		if (err){
				console.log("error");
				res.json({error: true, log_in_sucess: false, invalid_name: false, invalid_password: false, token: undefined});
		}else if(!val){
				res.json({error: false, log_in_sucess: false, invalid_name: true, invalid_password: false, token: undefined});
		}else{
			console.log(val)
			bcrypt.compare(req.body.password, val['password']).then(valid =>{
				if(valid){
					let json_token = jwt.sign({username: req.body.username}, cookie_secret,  { expiresIn: '1h' });
					console.log(json_token);
					res.json({error: false, log_in_sucess: true, invalid_name: false, invalid_password: false, token: json_token});
				}else{
					res.json({error: false, log_in_sucess: false, invalid_name: false, invalid_password: true, token: undefined});
				}
			})
		}
	})
})

/*
spotify_id INTEGER(255), 
	  total_rating INTEGER(255),
	  num_ratings INTEGER(255))
	  */
//
/*{
	spotify_id : username
	rating_score : token
}*/
app.post('/post', (req, res) => {
	console.log("username and token: ", req.body.username, req.body.token)
	if(!authenticate_token(req.body.token, req.body.username)){
		res.json({error:true, log_in:false})
		return;
	}
		
		db.run(`CREATE TABLE ${req.body.username} (
	    id INTEGER PRIMARY KEY,
		  spotify_id INTEGER(255), 
		  user_rating INTEGER(255));`, (err)=>{
			if(err){
				console.log(err);
				console.log(req.body.username + " table already made")
			}
		})

    updatePost(req.body.spotify_id, req.body.rating_score, req.body.username).then((result)=>{
    	console.log(result);
    	update_user_rating(req.body.spotify_id, req.body.username, req.body.rating_score)
    	res.json(result);
    })
});

//SELECT TOP number_of_rows * FROM Posts ORDER BY id DESC WHERE ();
/*{
	search_term : username
	limit : token
	offset:
}*/
app.get('/post', (req, res) => {
	/*
	console.log("username and token: ", req.body.username, req.body.token)
	if(!authenticate_token(req.body.username, req.body.token)){
		res.json({error:true, log_in:false})
		return;
	}
	*/
  console.log(req.query);
	console.log('https://api.spotify.com/v1/search?q=track%3A' + req.query.search_term+ '&type=track&limit=' + req.query.limit + "&offset=" + req.query.offset)
	getSearchTerm(req.query.search_term, req.query.limit, req.query.offset, req.query.username).then((result)=>{
		res.json(result);
	});
});

app.listen(2999, () => {
	console.log('server on port 2999')
})

console.log("hi")