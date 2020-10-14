const jwt = require('jsonwebtoken');
const User = require('./../../Models/User');

const personaliser = ()=>{
    return async (req,res,next)=>{
        req.isPersonalised = false;
        try{
            const token = req.cookies.token;
            const decoded = jwt.verify(token,process.env.JWT_TOKEN_KEY);
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
        // try{
        //     // Older bearer token authorization
        //     // const token = req.header('Authorization').replace('Bearer ','');

        //     // Newer httponly cookie based authorization
        //     const token = req.cookies.token;
        //     let isPersonalised = false;
        //     let personalisation = {};
        //     if(token){
        //         const decoded = jwt.verify(token, process.env.JWT_TOKEN_KEY);
        //         let user = await User.findOne({_id: decoded._id, 'tokens.token':token});
        //         if(user){
        //             isPersonalised = true;
        //             personalisation = user;
        //         }
        //     }
        //     req.isPersonalised = isPersonalised;
        //     req.personalisation = personalisation;
        //     next();
        // }catch(error){
        //     req.isPersonalised = false;
        //     next();
        // }
    }
}

module.exports = personaliser;