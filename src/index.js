// Core Node dependencies
const fs = require('fs');



// GLobal dependencies
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
if(!process.env.PORT)
    require('dotenv').config();

    

// Paths and URLs
const viewPath = path.join(__dirname,'../views/templates');
const partialsPath = path.join(__dirname,'../views/partials');



// Middlewares
const express = require('express');
const cookieParser = require('cookie-parser');
const slashes = require("connect-slashes");       // To remove or add trailing slash at end of request url

// Personal Middlewares
const auth = require('./Middleware/auth.js');   // Use as per requirement
const maintenance = require('./Middleware/maintenance.js');     // Applies to all routes and prevents access while maintenance
const personalise = require('./Middleware/personalise.js')      // Personalises as per auth cookies if they exist



// Setting up the server and integrating middlewares
const port = process.env.PORT || 3000
const app = express();

app.use(express.json());        // Body Parser
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies
app.use(cookieParser());        // Parse cookies

app.use(express.static(path.join(__dirname, '../public'))).use(slashes(false));     // Serve public files

app.set('view engine', 'hbs');  // Templating engine
app.set('views', viewPath);     // Template path
hbs.registerPartials(partialsPath);     // Partials path

app.use(maintenance, personalise());

app.listen(port, ()=> console.log("Server started properly."));



// Setting the MongoDB
mongoose.connect(
  process.env.MONGOOSE_SRV_BQ_DB,
  {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology:true
  }
).catch((err)=>console.log(err));
mongoose.set('useFindAndModify', false);        // Overcoming mongoose deprecation



// Preparing routers
const authorisation = require('./Routes/authorisation');
const demand = require('./Routes/demand');
const {mailto} = require('./Modules/mailer');
app.use(authorisation, demand);

app.get("/", (req, res) => {
  res.render('');
});






app.get('*', (req,res)=>{
  res.send("<center><h1>Page not found !</h1></center>")
});
