const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');


const preUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique:true
    },
    password: {
        type: String,
        required:true
    }
});

preUserSchema.methods.generateToken = function(){
    return jwt.sign({"_id" : this._id.toString()}, process.env.JWT_TOKEN_KEY, { expiresIn:'5 days' } );
}

// Hashing password before saving
preUserSchema.pre('save', async function (next){
    let user = this;
    if(user.isModified('password'))
        user.password = jwt.sign({"password": user.password}, process.env.JWT_TOKEN_KEY);
    next();
});

const preUser = new mongoose.model('preUser', preUserSchema);

module.exports = preUser;