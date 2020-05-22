/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Create Database Connection
var pgp = require('pg-promise')();

/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.  We'll be using localhost and run our database on our local machine (i.e. can't be access via the Internet)
  port: This defines what port we can expect to communicate to our database.  We'll use 5432 to talk with PostgreSQL
  database: This is the name of our specific database.  From our previous lab, we created the football_db database, which holds our football data tables
  user: This should be left as postgres, the default user account created when PostgreSQL was installed
  password: This the password for accessing the database.  You'll need to set a password USING THE PSQL TERMINAL THIS IS NOT A PASSWORD FOR POSTGRES USER ACCOUNT IN LINUX!
**********************/


const dbConfig = process.env.DATABASE_URL;
											

var db = pgp(dbConfig);
var tripCurr=2;

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory



// login page
app.get('/', function(req, res) {
	res.render('pages/loginPage',{
		local_css:"signIn.css",
		my_title:"Login Page"
	});
});


//homePage
app.get('/homepage', function(req, res) {
	res.render('pages/homepage',{
		local_css:"mystyle.css"
	});
});

//newGroup
app.get('/addGroup', function(req, res) {
	res.render('pages/addGroup',{
		local_css:"addGroup.css"
	});
});

//current Trips
app.get('/currentTrips', function(req, res) {
	var query = "select group_id, group_name from groups where archive='f';";
	db.any(query)
        .then(function (rows) {
            // render views/store/list.ejs template file
            res.render('pages/currentTrips',{
				local_css:"currentTrips.css",
				trips: rows,
				trip_info: '',
				name: ''
			})

        })
        .catch(function (err) {
            // display error message in case an error
            request.flash('error', err);
            response.render('pages/currentTrips', {
                local_css: "currentTrips.css",
                trips: '',
                trip_info: ''
            })
        })

});

app.get('/currentTrips/get_trip', function(req, res) {
	var trip_id = req.query.user_choice;
	if (trip_id){	
	tripCurr = trip_id;}
	var list_trips= "select group_id, group_name from groups where archive='f';";
	var chosen_trip = 'select * from transactions where group_id=' + tripCurr + ';';
	var trip_name = 'select group_name from groups where group_id=' +tripCurr + ';';

	 db.task('get-everything', task => {
        return task.batch([
            task.any(list_trips),
            task.any(chosen_trip),
	    task.any(trip_name)
        ]);
    })
    .then(data => {
				console.log(data[0]);
				console.log('data[1]: '+data[1]);
				console.log('data[2]: '+data[2]);
				console.log('trip_id: '+trip_id);
    	res.render('pages/currentTrips',{
				

				local_css: "currentTrips.css",
				selection: trip_id,
				trips: data[0],
				trip_info: data[1],
				name: data[2]
			})
    })
    .catch(error => {
        // display error message in case an error
            request.flash('error', err);
            response.render('pages/currentTrips', {
                local_css: "currentTrips.css",
                trips: '',
                trip_info: ''
            })
    });

});




//archived trips
app.get('/archive', function(req, res) {
	var query = "select group_id, group_name from groups where archive='t';";
	db.any(query)
        .then(function (rows) {
            // render views/store/list.ejs template file
            res.render('pages/archive',{
				local_css:"archive.css",
				trips: rows,
				trip_info: '',
				name: ''
			})

        })
        .catch(function (err) {
            // display error message in case an error
            request.flash('error', err);
            response.render('pages/archive', {
                local_css: "archive.css",
                trips: '',
                trip_info: ''
            })
        })

});

app.get('/archive/get_trip', function(req, res) {
	var trip_id = req.query.user_choice;
	tripCurr = trip_id;
	var list_trips= "select group_id, group_name from groups where archive='t';";
	var chosen_trip = 'select * from transactions where group_id=' + trip_id + ';';
	var trip_name = 'select group_name from groups where group_id=' +trip_id + ';';

	 db.task('get-everything', task => {
        return task.batch([
            task.any(list_trips),
            task.any(chosen_trip),
	    task.any(trip_name)
        ]);
    })
    .then(data => {
    	res.render('pages/archive',{
				local_css: "archive.css",
				selection: trip_id,
				trips: data[0],
				trip_info: data[1],
				name: data[2]
			})
    })
    .catch(error => {
        // display error message in case an error
            request.flash('error', err);
            response.render('pages/archive', {
                local_css: "arvhice.css",
                trips: '',
                trip_info: ''
            })
    });

});

//spliTrips

app.get('/splitTable', function(req, res) {
	var id = tripCurr;
	console.log(id);
	var total = 'select SUM(amount) from transactions where group_id=' + id + ';';
	var members = 'select first_name, amount_paid from members where group_id='+id + ';';
	var numMem = 'select count(*) from members where group_id=' + id + ';';
	console.log(total);
	console.log(members);
	console.log(numMem);

	 db.task('get-everything', task => {
        return task.batch([
            task.any(total),
            task.any(members),
	    task.any(numMem)
        ]);
    })
    .then(data => {
    	res.render('pages/splitTable',{
				total_cost: data[0],
				member_list: data[1],
				numMembers: data[2]
	
		
			})
	console.log(data[0])
	console.log(data[1])
	console.log(data[2])
    })
    .catch(error => {
        // display error message in case an error
            request.flash('error', err);
            response.render('pages/player_info', {
                total_cost:'',
		member_list: '',
		numMembers: ''
            })
    });

});



//app.listen(3000);
app.listen(process.env.PORT);
											
											
