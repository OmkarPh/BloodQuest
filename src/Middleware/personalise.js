const jwt = require('jsonwebtoken');
const User = require('./../../Models/User');

const personaliser = ()=>{
    return async (req,res,next)=>{
        req.isPersonalised = false;
        try{
            const token = req.cookies.token;
            if(!token)
                throw new Error();

            const decoded = jwt.verify(token,process.env.JWT_TOKEN_KEY);
            if(!decoded)
                throw new Error();

            let user = await User.findOne({_id: decoded._id, 'tokens.token':token});
            if(!user)
                throw new Error();

            req.isPersonalised = true;
            req.token = token;
            req.user = user;
            
            next();
        }catch(error){
            req.isPersonalised = false;
            next();
        }
    }
}

module.exports = personaliser;