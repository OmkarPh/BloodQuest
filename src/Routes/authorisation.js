const express = require('express');
const router = new express.Router();
const auth = require('./../Middleware/auth');
const User = require('./../../Models/User');
const ProfilePic = require('./../../Models/ProfilePic');
const multer = require('multer');
const sharp = require('sharp');

const stringToArrayConversions = ['age','sex','bloodType','diseaseCount','phone','whatsapp','pin']

const picMulter = multer({
  limits:1000000
});


// Signup and login page 
router.get("/sign", (req,res)=>{
    res.render('signLog.hbs')
})

// Signup API
router.post("/auth/signup", picMulter.single('pic'), async (req,res)=>{
  stringToArrayConversions.forEach(key => req.body[key] = parseInt(req.body[key]));
  req.body.address={
    country: req.body.country,
    state: req.body.state,
    district: req.body.district,
    pin: req.body.pin,
    localAddress: req.body.localAddress
  };
  try{
    let newUser = new User(req.body);
    let token = await newUser.generateToken();
    req.file.buffer = await sharp(req.file.buffer).resize(256,256).png().toBuffer();
    let pic = new ProfilePic({pic:req.file.buffer});
    await pic.save();
    newUser.profilePicID = pic;
    await newUser.save();
    console.log("Created user ", newUser.firstName, newUser.email);
    res.cookie('token',token);
    return res.redirect('/me');
  }catch(error){
    if(error.code == 11000)
      return res.send("User with this email ID already exits");
    console.log(error);
    return res.send("Something went wrong :(");
  }

});

router.post("/auth/login", async (req,res)=>{
  try{
    let user = await User.findUserByCredentials(req.body.email, req.body.password);
    let token = await user.generateToken();
    res.cookie('token',token);
    res.redirect('/me');
  }catch(error){
    res.send('Unable to login');
  }
});



router.get("/me", auth(), async (req, res)=>{
    await req.user.populate('profilePicID').execPopulate();
    
    res.set('Content-Type', 'image/jpg');
    res.send(req.user.profilePicID.pic);
  })



module.exports = router;