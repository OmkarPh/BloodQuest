const jwt = require('jsonwebtoken');
const User = require('../../Models/User')

const auth = (messageForLoginRequirements)=>{
    return async (req,res,next)=>{
        
        try{
            const token = req.cookies.token;
            const decoded = jwt.verify(token,process.env.JWT_TOKEN_KEY);
            let user = await User.findOne({_id: decoded._id, 'tokens.token':token});
            if(!user)
                throw new Error();
            req.token = token;
            req.user = user;
            next();
        }catch(error){
            if(messageForLoginRequirements)
                res.status(307).redirect('/login?message='+messageForLoginRequirements);
            else
                res.status(307).redirect('/login');
        }
    }
}

module.exports = auth;