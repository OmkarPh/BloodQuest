const jwt = require('jsonwebtoken');
const User = require('./../../Models/User');

module.exports = () =>{
    return async(req,res,next)=>{
        try{
            const token = req.cookies.token;
            const decoded = jwt.verify(token,process.env.JWT_TOKEN_KEY);
            let user = await User.findOne({_id: decoded._id, 'tokens.token':token});
            if(!user)
                throw new Error();
            req.token = token;
            req.user = user;
            console.log(req.user);
            if(req.user.email == "omkarphansopkar@gmail.com")
                next();
            else
                throw new Error();
        }catch(error){
            res.status(404).redirect('/pageNotFound');
        }
    }
}