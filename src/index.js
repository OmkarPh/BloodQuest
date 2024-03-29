// Core Node dependencies
const fs = require('fs');

// GLobal dependencies
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');

// Import environment variables only in development
if(process.env.NODE_ENV !== "production")
    require('dotenv').config();

// Modules
const {mailer, contactMessage} = require('./Modules/mailer');

// Paths and URLs for handlebar templates & partials
const viewPath = path.join(__dirname, '../views/templates');
const partialsPath = path.join(__dirname, '../views/partials');

// Middlewares
const express = require('express');
const cookieParser = require('cookie-parser');
const slashes = require("connect-slashes");       // Remove/add trailing slash at end of request url

// Personal Middlewares
const auth = require('./Middleware/auth.js');
const maintenance = require('./Middleware/maintenance.js');     // Applies to all routes and prevents access while maintenance
const personalise = require('./Middleware/personalise.js')      // Personalise requests

// Setting up the server
const port = process.env.PORT || 3000
const app = express();

// Integrating middlewares
app.use(express.json());        // Body Parser
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies
app.use(cookieParser());        // Parse cookies
app.use(express.static(path.join(__dirname, '../public'))).use(slashes(false));     // Serve static files

app.set('view engine', 'hbs');  // Setup handlebars templating engine
app.set('views', viewPath);     // Template path
hbs.registerPartials(partialsPath);     // Partials path

app.use(maintenance, personalise());
app.listen(port, ()=> console.log("Blood Quest Server up and running properly."));


// Setting the MongoDB
mongoose.connect(
  process.env.MONGOOSE_SRV_BQ_DB,
  {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology:true
  }
).catch((err)=>{
  console.log("Error in mongoose connection !");
  console.log(err)
});
mongoose.set('useFindAndModify', false);        // Overriding mongoose deprecation


// Preparing routers
const authorisation = require('./Routes/authorisation');
const demand = require('./Routes/demand');
const donation = require('./Routes/donation');
app.use(authorisation, demand, donation);


app.get("/", (req, res) => {
  let personalisationDetails = {};
  if(req.isPersonalised)
    personalisationDetails = {loggedIn: true, firstName: req.user.firstName, email: req.user.email };
  res.render('', personalisationDetails);
});

app.post("/contact", async(req,res)=>{
  contactMessage(req.body.email, req.body.name, req.body.message, ()=>console.log("Sent contact message"));
  res.status(200).send("success");
})

app.get('/message',(req,res)=>{
  if(req.isPersonalised)
    req.query = {...req.query, loggedIn: true, firstName: req.user.firstName, email: req.user.email };
  res.render("message",req.query);
});

app.get('/pageNotFound', (req,res)=>{
  res.status(404).render("pageNotFound.hbs")
});

app.get('*', (req,res)=>{
  res.status(404).render("pageNotFound.hbs")
});