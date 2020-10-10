const jwt = require('jsonwebtoken');
const User = require('../../Models/User')

const auth = (options)=>{
    return async (req,res,next)=>{
        if(!options)
            options = {dontRedirect: false};
        try{
            const token = req.cookies.token;
            const decoded = jwt.verify(token,process.env.JWT_TOKEN_KEY);
            let user = await User.findOne({_id: decoded._id, 'tokens.token':token});
            if(!user)
                throw new Error();
            
            // This condition is true only if default values are set, i.e. profile not completed
            if(user.bloodType == -1 && !options.dontRedirect)
                throw new Error("Profile not set yet");

            req.token = token;
            req.user = user;
            next();
        }catch(error){
            if(error.message == "Profile not set yet")
                return res.status(303).redirect('/editProfile');
            if(messageForLoginRequirements)
                return res.status(307).redirect('/login?message='+messageForLoginRequirements);
            res.status(307).redirect('/login');
        }
    }
}


module.exports = auth;