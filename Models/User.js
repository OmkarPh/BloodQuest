const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

//  Blood types array:
//  0   1   2   3   4   5   6    7      -1
//  A+  A-  B+  B-  O+  O-  AB+  AB-    Not specified yet

//  Sex types:
//  0   1   2
//  M   F   Other


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique:true
    },
    password: {
        type: String,
        required:true
    },
    age:{
        type: Number,
        default:''
    },
    bloodType:{
        type: Number,
        default: -1
    },
    firstName:{
        type: String,
        default:''
    },
    lastName:{
        type: String,
        default: ''
    },
    sex: {
        type: String
    },
    diseaseCount:{
        type: Number,
        default: 0
    },
    diseases:[{
        type: String
    }],
    phone:{
        type: Number
    },
    whatsapp:{
        type: Number
    },
    profilePicID:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Pics'
    },
    address:{
        country:{
            type:String     
        },
        state:{
            type:String
        },
        district:{
            type:String
        },
        pin:{
            type: Number
        },
        localAddress:{
            type:String
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
});

// Utility functions
userSchema.statics.findUserByCredentials = async (email,password)=>{
    const user = await User.findOne({email});

    if(!user)
        throw new Error("No account found for this email !");

    const isMatch = await bcryptjs.compare(password, user.password);
    
    if(!isMatch)
        throw new Error("Unable to login");

    return user;
}

userSchema.methods.generateToken = async function(){
    let user = this;
    let token = jwt.sign({"_id" : user._id.toString()}, process.env.JWT_TOKEN_KEY, { expiresIn:'1 day' } );
    if(user.tokens.length >= 3)
        user.tokens.$shift();
    user.tokens = user.tokens.concat({token});
    user.save();
    return token;
}

userSchema.methods.toJSON = function(){
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;
    return userObject;
};


// Hashing password before saving
userSchema.pre('save', async function (next){
    let user = this;
    if(user.isModified('password'))
        user.password = await bcryptjs.hash(user.password, 8);
    next();
});

const User = new mongoose.model('Users', userSchema);

module.exports = User;



// let newUser = new User({
//     email: "omkarphansopkar@gmail.com",
//     password: "omkar1432003",
//     age: 17,
//     bloodType: 4,
//     sex: 0,
//     firstName:"Omkar",
//     lastName: "Phansopkar",
//     diseaseCount: 0,
//     phone: 7045270840,
//     whatsapp: 7045270840,
//     address:{
//       country: "India",
//       state: "Maharashtra",
//       district: "Mumbai",
//       pin: 400097,
//       localAddress: "Malad East, Mumbai"
//     }
//   });
//   newUser.save();