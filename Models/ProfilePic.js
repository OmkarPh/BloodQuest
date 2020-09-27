const mongoose = require('mongoose');

const profilePic = new mongoose.model('Pics',{
    pic:{
        type: Buffer
    }
})

module.exports = profilePic;