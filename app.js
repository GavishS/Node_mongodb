/**
     * Here Using express Web FrameWork
     * route name userview     
     * index.html - This page is uses for Date filtering and Display Data
     * start project with node app.js
     * Need to Add data
     * paste this url in browser : http://localhost:5500/view/index.html
    */

require('dotenv').config()
let express = require('express'),
  path = require('path'),
  mongoose = require('mongoose'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  dataBaseConfig = require('./database/db');

// Connecting mongoDB
mongoose.set('debug', true);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect(dataBaseConfig.db, {
  useNewUrlParser: true
}).then(() => {
  console.log('Database connected sucessfully ')
},
  error => {
    console.log('Could not connected to database : ' + error)
  }
)

// Set up express js port
const UserViewRoute = require('./routes/userview.route')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cors());


// RESTful API root
app.use(express.static(__dirname + '/'));
app.use('/api', UserViewRoute)

// PORT
const port = process.env.PORT;

app.listen(port, () => {
  console.log('Connected to port ' + port)
})


// Index Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/view/index.html'));
});


// error handler
app.use(function (err, req, res, next) {
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});