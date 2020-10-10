const express = require('express');
const router = new express.Router();
const auth = require('./../Middleware/auth');
const preUser = require('./../../Models/PreUser');
const User = require('./../../Models/User');
const ProfilePic = require('./../../Models/ProfilePic');
const multer = require('multer');
const sharp = require('sharp');
const admin = require('./../Middleware/admin');
const District = require('./../../Models/District');
const {confirmEmail} = require('./../Modules/mailer');
const jwt = require('jsonwebtoken');


const stringToArrayConversions = ['age','sex','bloodType','diseaseCount','phone','whatsapp','pin'];


const picMulter = multer({
  limits:1000000
});


// Signup and login page 
router.get("/login", (req,res)=>{
  res.render('signLog.hbs')
})
router.get("/signup", (req,res)=>{
    res.render('signup.hbs')
})


// // Signup API
// router.post("/auth/signup", picMulter.single('pic'), async (req,res)=>{
//   stringToArrayConversions.forEach(key => req.body[key] = parseInt(req.body[key]));
//   req.body.address={
//     country: req.body.country,
//     state: req.body.state,
//     district: req.body.district,
//     pin: req.body.pin,
//     localAddress: req.body.localAddress
//   };

//   try{
//     let newUser = new User(req.body);
//     let token = await newUser.generateToken();
//     req.file.buffer = await sharp(req.file.buffer).resize(256,256).jpeg({
//       quality: 100,
//       chromaSubsampling: '4:4:4'
//     }).toBuffer();
//     let pic = new ProfilePic({pic:req.file.buffer});
//     await pic.save();
//     newUser.profilePicID = pic._id;
//     await newUser.save();
//     console.log("Created user ", newUser.firstName, newUser.email);
//     res.cookie('token',token);
//     res.redirect('/me');

//     let district = await District.findOne({name: req.body.district});
//     district.bloods[req.body.bloodType].people.push(newUser._id);
//     district.save();
//   }catch(error){
//     if(error.code == 11000)
//       return res.send("User with this email ID already exits");
//     console.log(error);
//     return res.send("Something went wrong :(");
//   }

// });

// Signup API pre Signup
router.post("/auth/signup", async (req,res)=>{

  try{
    let newPreUser = new preUser(req.body);
    let token = await newPreUser.generateToken();
    await newPreUser.save();
    res.status(400).send("Confirm your account by the link sent to your email !");
    confirmEmail(req.body.email, token);    
  }catch(error){
    if(error.code == 11000)
      return res.send("User with this email ID already exits");
    // console.log(error);
    return res.redirect('/pageNotFound');
  }

});
// Signup verification
router.get('/auth/verify', async (req,res)=>{
  try{
    let initUser = jwt.verify(req.query.token, process.env.JWT_TOKEN_KEY);
    initUser = await preUser.findById(initUser._id);

    if(!initUser)
      throw Error("Not found user");
    initUser.password = jwt.verify(initUser.password, process.env.JWT_TOKEN_KEY).password;

    let newUser = new User({email: initUser.email, password: initUser.password});
    await newUser.save();

    console.log("Created temp user ", newUser.firstName, newUser.email);

    res.send('Confirmed the email, <a href="/login">login here</a>');

    preUser.findByIdAndDelete(initUser._id);
  }catch(error){
    if(error.code == 11000)
      return res.send('Email already confirmed! <a href="/login">login here</a>');
    console.log(error);
    return res.redirect('/pageNotFound');
  }
})
router.get("/editProfile", async(req,res)=>{
  // DON'T USE auth() middleware for this, it will cause a recursive infinite loop, since auth() again redirects here for incompleted profiles, so manually parse and find users

  res.render("editProfile.hbs", {message: "Complete your profile first !", email: "omkarphansopkar@gmail.com"});
})
router.post("/auth/saveProfile", async(req,res)=>{
    try{
      const token = req.cookies.token;
      const decoded = jwt.verify(token,process.env.JWT_TOKEN_KEY);
      let user = await User.findOne({_id: decoded._id, 'tokens.token':token});
      if(!user)
          throw new Error();

      console.log(user)
      console.log(req.body);
    
      // let district = await District.findOne({name: req.body.district});
      // district.bloods[req.body.bloodType].people.push(newUser._id);
      // district.save();

      res.send("Saved");
    }catch(error){
        res.status(307).redirect('/login');
    }
});

router.post("/auth/login", async (req,res)=>{
  try{
    let user = await User.findUserByCredentials(req.body.email, req.body.password);
    let token = await user.generateToken();
    res.cookie('token',token);
    res.redirect('/me');
  }catch(error){
    console.log(error);
    res.send('Unable to login');
  }
});








router.get("/me", auth(), async (req, res)=>{
    res.render('profile.hbs', {data:req.user});
});
router.get("/myDP", auth(), async(req,res)=>{
    await req.user.populate('profilePicID').execPopulate();
    res.set('Content-Type', 'image/jpeg');
    res.send(req.user.profilePicID.pic)
});
router.get('/admin', admin(), async(req,res)=>{
  res.render('admin.hbs');
});

module.exports = router;