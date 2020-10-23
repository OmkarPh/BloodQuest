// req.isPersonalised is set to true and other stuff prepared in personalise middleware itself.

const auth = (options)=>{
    return async (req,res,next)=>{
        if(!options)
            options = {dontRedirect: false};
        try{
            if(!req.isPersonalised)
                throw new Error();
            
            // This condition is true only if default values are set, i.e. profile not completed
            if(req.user.bloodType == -1 && !options.dontRedirect)
                throw new Error("Profile not set yet");

            next();
        }catch(error){
            if(error.message == "Profile not set yet")
                return res.status(303).redirect('/editProfile?message=Complete your profile first !');
            if(options.messageForLoginRequirements)
                return res.status(307).redirect('/login?message='+messageForLoginRequirements);
                
            res.status(307).redirect('/login');
        }
    }
}


module.exports = auth;