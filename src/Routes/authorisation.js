// NPM dependencies
const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const path = require('path');

// Models
const preUser = require('./../../Models/PreUser');
const User = require('./../../Models/User');
const ProfilePic = require('./../../Models/ProfilePic');
const District = require('./../../Models/District');

// Middlewares
const auth = require('./../Middleware/auth');
const admin = require('./../Middleware/admin');

// Modules
const {confirmEmail, requestConfirmation, forgotPassword} = require('./../Modules/mailer');



const stringToArrayConversions = ['age','sex','bloodType','diseaseCount','phone','whatsapp','pin'];
let bloodTypes = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
let sexes = ["Male", "Female", "Other"];

const picMulter = multer({
  limits:1000000
});


// Pages
router.get("/login", (req,res)=>{
  if(req.isPersonalised)
    return res.redirect('/me');
  res.render('login.hbs')
});

router.get("/signup", (req,res)=>{
  if(req.isPersonalised)
    return res.redirect('/me');
  res.render('signup.hbs')
});

router.get("/forgot", (req,res)=>{
  if(req.isPersonalised)
    return res.redirect('/pageNotFound');
  res.render('forgot.hbs')
});

router.get('/emailVerification', (req,res)=>{
  if(req.isPersonalised)
    return res.redirect('/pageNotFound');
  res.render('emailAgain.hbs');
});

router.get("/me", auth(), async (req, res)=>{
    res.render('profile.hbs', {data:req.user, blood: bloodTypes[req.user.bloodType],
      sex: sexes[req.user.sex], diseaseString: req.user.diseases.join(", ")});
});

router.get('/admin', admin(), async(req,res)=>{
  res.render('admin.hbs');
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
router.get("/editProfile", auth({dontRedirect: true}), async(req,res)=>{
  try{
    if(!req.user)
      throw new Error("Not logged in");
    let message = req.query.message ? req.query.message : "Edit profile";

    if(!(req.user.sex && (req.user.sex >=0 && req.user.sex <3))) 
    req.user.sex = 1;

    res.render("editProfile.hbs",{message, user: req.user, diseaseString: req.user.diseases.join(", ")});
  }catch(error){
      if(error.message == "Not logged in")
        return res.redirect('/login');

      console.log("Something really wrong happened in editProfile page router!");
      console.log(error);
  }

});

// Login API
router.post("/auth/login", async (req,res)=>{
  try{
    let user = await User.findUserByCredentials(req.body.email, req.body.password);
    if(!user){
      let preUser = await preUser.findOne({email: req.body.email});
      if(!preUser)
        throw new Error("No account found for this email !");
      throw new Error("Account not verified yet");
    }
    let token = await user.generateToken();
    res.cookie('token',token,{
        maxAge:10800000,
        httpOnly:true
    });
    res.redirect('/me');
  }catch(error){
    if(error.message == "No account found for this email !")
      return res.redirect('/message?title=No account found&linkHref=/signup&linkTitle=Signup instead');
    if(error.message == "Account not verified yet")
      return res.redirect('/message?title=Account not verified yet.&description=Check your email for confirmation link or,&linkTitle=Resend confirmation email&linkHref=/emailVerification');
    res.redirect('/message?title=Unable to login');
  }
});


// Logout API
router.get("/auth/logout", auth(), async(req,res)=>{
  try{
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.redirect('/');
  }catch(e){
    res.redirect('/message?title=Something went wrong!&linkHref=/&linkTitle=Home Page');
  }
});

// Signup API
let confirmationTitle = "Confirm your account by the link sent to your email !";
let confirmationDescription = "Check the spam/update/social folder, if email is not visible in inbox";

router.post("/auth/signup", async (req,res)=>{
  try{
    let doesAlreadyExist = await User.exists({email: req.body.email});
    if(doesAlreadyExist)
      throw new Error("User exists already");

    let doesPreUserExist = await preUser.exists({email: req.body.email});
    if(doesPreUserExist)
      throw new Error("Pre user exists already");

    let newPreUser = new preUser(req.body);
    let token = await newPreUser.generateToken();
    await newPreUser.save();
    res.redirect(`/message?title=${confirmationTitle}&description=${confirmationDescription}`);
    confirmEmail(req.body.email, token);    
  }catch(error){
    if(error.message == "Pre user exists already")
      return res.redirect(`/message?title=This email is already registered, It not yet verified&description=Check spam/update/promotion folders if our email is not visible in Inbox !&linkTitle=Send email again&linkHref=/emailVerification`);

    if(error.message == "User exists already")
      return res.redirect('/message?title=User exists already&linkHref=/login&linkTitle=Login here');

    console.log("Something wrong in signup !");
    console.log(error);
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

    console.log("Created temp user ", newUser.email);
    
    res.redirect('/message?title=Confirmed the email&linkHref=/login&linkTitle=Login here');

    preUser.findByIdAndDelete(initUser._id, ()=>{});
  }catch(error){
    if(error.code == 11000)
      res.redirect('/message?title=Email already confirmed!&linkHref=/login&linkTitle=login here');
    return res.redirect('/pageNotFound');
  }
});

// Signup denial
router.get('/auth/deny', async (req,res)=>{
  try{
    let initUser = jwt.verify(req.query.token, process.env.JWT_TOKEN_KEY);
    preUser.findByIdAndDelete(initUser._id, ()=>{});
    return res.redirect('/message?title=Deleted your data from our System');
  }catch(error){
    console.log(error);
    res.redirect('/message?title=Deleted your data from our System');
  }
});

// Request email again
router.post('/emailAgain', async (req,res)=>{
  try{
    let existingUser = await preUser.findOne({email: req.body.email});
    if(existingUser){
      let token = await existingUser.generateToken();
      requestConfirmation(req.body.email, {token});
    }
    return res.redirect('/message?title=If email ID is correct, you will receive confirmation email with link&description=Check spam/updates/promotions if not visible in inbox.');
  }catch(error){
    console.log(error);
    res.redirect('/message?title=Something went wrong in our System, try again or contact admin.');
  }
})

// Save edited profile
router.post("/auth/saveProfile", auth({dontRedirect: true}), picMulter.single('newProfilePicture'), async(req,res)=>{
  stringToArrayConversions.forEach(key =>{
    if(req.body[key])
      req.body[key] = parseInt(req.body[key]);
    else 
      delete req.body[key];
  });
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
      console.log('Something went really wrong in /auth/saveProfile');
      console.log(error)
      if(!res.headersSent) res.redirect("/message?title=Something went wrong 500");
    }
});

// Forgot link creation API
router.post("/auth/forgot", async(req,res)=>{
  try{
    let existingUser = await User.findOne({email: req.body.email})
    if(!existingUser)
      throw new Error("User not found");

    let forgotToken = await jwt.sign(
      {"_id" : existingUser._id.toString()},
      process.env.JWT_TOKEN_KEY, 
      { expiresIn:'5 days' } 
    );

    let name = existingUser.firstName || "Blood Quest user";
    
    forgotPassword(req.body.email, forgotToken, name);

    res.redirect('/message?title=Kindly Check your email for password reset link.');
  }catch(error){
    if(error.message == "User not found")
      return res.redirect('/message?title=No user found with the given email&linkHref=/signup&linkTitle=Signup here');
    console.log("Error in auth/forgot", error);
    res.redirect('/message?title=Something went wrong&description=Contact site administrator, our project is in beta phase, so this might be one of hidden bugs.');
  }
});

// Password reset page
router.get("/resetPass", async(req,res)=>{
  if(req.isPersonalised)
    return res.redirect('../pageNotFound');
  try{
    let initUser = jwt.verify(req.query.token, process.env.JWT_TOKEN_KEY);
    if(!initUser)
      return res.redirect('/pageNotFound');

    let user = await User.findById(initUser._id);
    if(!user)
      return res.redirect('../pageNotFound');

    return res.render('reset.hbs', {token: req.query.token});
  }catch(error){
    console.log(error);
    res.redirect('/message?title=Deleted your data from our System');
  }
});

// Password reset API
router.post("/auth/saveNewPass", async(req,res)=>{
  if(req.isPersonalised)
    return res.redirect('/pageNotFound');
  try{
    let initUser = jwt.verify(req.body.token, process.env.JWT_TOKEN_KEY);
    if(!initUser)
      return res.redirect('/pageNotFound');

    let user = await User.findById(initUser._id);
    if(!user)
      return res.redirect('/pageNotFound');
    user.password = req.body.password;

    await user.save();
    return res.redirect('/message?title=Password reset successfuly&linkTitle=Login here&linkHref=../login');
  }catch(error){
    console.log(error);
    res.redirect('/message?title=Something went wrong&description=Contact site administrator, our project is in beta phase, so this might be one of hidden bugs.');
  }
});




module.exports = router;



