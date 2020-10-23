// req.isPersonalised is set to true and other stuff prepared in personalise middleware itself.

module.exports = () =>{
    return async(req,res,next)=>{
        try{
            if(!req.isPersonalised)
                throw new Error();

            // req.user is already obtained from personalise, if user logged in 
            if(req.user.email == "omkarphansopkar@gmail.com"){
                console.log("Admin acitvity detected !");
                next();
            }else
                throw new Error();
        }catch(error){
            res.status(404).redirect('/pageNotFound');
        }
    }
}