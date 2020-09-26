// Applies to all, so change carefully !

const maintenance = ((req,res,next)=>{
    let isUnderMaintenance = process.env.MAINTENANCE_MODE.toLowerCase().includes('yes') ? true : false;
    if(isUnderMaintenance)
        res.status(503).send("<center><br><br><br><br><h1>Sorry, the site is currently under maintenance :( Come back soon !</h1></center>");
    else
        next();
})

module.exports = maintenance;