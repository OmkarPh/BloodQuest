const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// const userSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//         trim: true,
//         unique:true
//     },
//     password: {
//         type: String,
//         required:true
//     },
//     age:{
//         type: Number,
//         required:true
//     },
//     firstName:{
//         type: String,
//         required:true
//     },
//     lastName:{
//         type: String,
//         default: ''
//     },
//     college:{
//         type:String,
//         default:"unknown"
//     },
//     // Levels:      1->Normal user       4->Developers       5->Administrator(Me)
//     level:{
//         type: Number,
//         default:1 
//     },
//     tokens:[{
//         token:{
//             type: String,
//             required: true
//         }
//     }]
// });

// // Utility functions
// userSchema.statics.findUserByCredentials = async (email,password)=>{
//     const user = await User.findOne({email});

//     if(!user)
//         throw new Error("No account found for this email !");

//     const isMatch = await bcryptjs.compare(password, user.password);
    
//     if(!isMatch)
//         throw new Error("Unable to login");

//     return user;
// }

// userSchema.methods.generateToken = async function(){
//     let user = this;
//     let token = jwt.sign({"_id" : user._id.toString()}, process.env.JWT_TOKEN_KEY, { expiresIn:'1 day' } );
//     if(user.tokens.length >= 3)
//         user.tokens.$shift();
//     user.tokens = user.tokens.concat({token});
//     user.save();
//     return token;
// }

// userSchema.methods.getPublicProfile = async function(){
//     return userObject;
// }
// userSchema.methods.toJSON = function(){
//     const userObject = this.toObject();
//     delete userObject.password;
//     delete userObject.tokens;
//     delete userObject.__v;
//     return userObject;
// }


// // Hashing password before saving
// userSchema.pre('save', async function (next){
//     let user = this;
//     if(user.isModified('password')){
//         user.password = await bcryptjs.hash(user.password, 8);
//     }
//     next();
// })

// const User = new mongoose.model('credentials', userSchema);

// module.exports = User;