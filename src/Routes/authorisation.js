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
const path = require('path');

const stringToArrayConversions = ['age','sex','bloodType','diseaseCount','phone','whatsapp','pin'];
let bloodTypes = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
let sexes = ["Male", "Femaile", "Other"];

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


// Signup API pre Signup
router.post("/auth/signup", async (req,res)=>{

  try{
    let newPreUser = new preUser(req.body);
    let token = await newPreUser.generateToken();
    await newPreUser.save();
    res.status(400).send("Confirm your account by the link sent to your email !<br> Check the spam folder, if email is not visible in inbox");
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

    preUser.findByIdAndDelete(initUser._id, ()=>{});
  }catch(error){
    if(error.code == 11000)
      return res.send('Email already confirmed! <a href="/login">login here</a>');
    console.log(error);
    return res.redirect('/pageNotFound');
  }
});


router.get("/editProfile", auth({dontRedirect: true}), async(req,res)=>{
  try{
    if(!req.user)
      throw new Error("Something really wrong happened in editProfile page router!");
    let message = req.query.message ? req.query.message : "Edit profile";
    req.user.sex = 1;
    res.render("editProfile.hbs",{message, user: req.user, diseaseString: req.user.diseases.join(", ")});
  }catch(error){
      res.status(307).redirect('/login');
  }

});


router.post("/auth/saveProfile", auth({dontRedirect: true}), picMulter.single('newProfilePicture'), async(req,res)=>{

  stringToArrayConversions.forEach(key => req.body[key] = parseInt(req.body[key]));
  req.body.address={
    country: req.body.country,
    state: req.body.state,
    district: req.body.district,
    pin: req.body.pin,
    localAddress: req.body.localAddress
  };
  req.body.diseases = req.body.diseaseString.split(",").map(val => val.trim());; 

  let isDistrictModified = req.user.address.district !== req.body.address.district;
  let previousDistrict = req.user.address.district;
  let isBloodModified = req.user.bloodType !== req.body.bloodType;
  let previousBlood = req.user.bloodType;
    try{
      // Updating user as per new data
      for(key in req.body)
        if(req.body[key] !== "")
          req.user[key] = req.body[key];

      // Updating profilePic if any
      if(req.file){
        // Delete old profile pic in async
        if(req.user.profilePicID && req.user.profilePicID !== "")
          ProfilePic.findByIdAndDelete(req.user.profilePicID, ()=>{});

        // Add new profile pic
        req.file.buffer = await sharp(req.file.buffer).resize(256,256).jpeg({
                quality: 100,
                chromaSubsampling: '4:4:4'
              }).toBuffer();
        let pic = new ProfilePic({pic:req.file.buffer});
        await pic.save();
        req.user.profilePicID = pic._id;
      }

      await req.user.save();
      console.log("Updated user ", req.user.firstName, req.user.email);
      res.redirect('/me');
  
      // Update blood&district relationship if modified
      if(isDistrictModified || isBloodModified){
        // Add user to new district and/or bloodType
        let district = await District.findDistrict(req.user.address.district);
        district.bloods[req.user.bloodType].people.push(req.user._id);
        district.save();

        // Remove user from existing district and/or bloodType
        if(previousDistrict && previousDistrict !== ""){
          let prevDistrictDB = await District.findDistrict(previousDistrict);
          prevDistrictDB.bloods[previousBlood].people.pull(req.user._id);
          prevDistrictDB.save();
        }
      }
    }catch(error){
      console.log(error)
      if(!res.headersSent) res.status(500).send("Something went wrong 500");
      console.log('Something went really wrong !');
    }
});



router.post("/auth/login", async (req,res)=>{
  try{
    let user = await User.findUserByCredentials(req.body.email, req.body.password);
    let token = await user.generateToken();
    res.cookie('token',token);
    res.redirect('/me');
  }catch(error){
    if(error.message == "No account found for this email !")
      res.send('No account found, <a href="/signup">signup instead</a>');
    else
      res.send('Unable to login');
  }
});








router.get("/me", auth(), async (req, res)=>{
    res.render('profile.hbs', {data:req.user, blood: bloodTypes[req.user.bloodType],
      sex: sexes[req.user.sex], diseaseString: req.user.diseases.join(", ")});
});

router.get("/myDP", auth({dontRedirect: true}), async(req,res)=>{
  try{
    await req.user.populate('profilePicID').execPopulate();
    res.set('Content-Type', 'image/jpeg');
    res.send(req.user.profilePicID.pic);
  }catch(err){
    res.set('Content-Type', 'image/png');
    res.sendFile(path.join(__dirname,"../../public/images/defaultPic.png"))
  }
});
router.get('/admin', admin(), async(req,res)=>{
  res.render('admin.hbs');
});

module.exports = router;




// Previous signup API
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