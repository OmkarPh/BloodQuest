// Applies to all, so change carefully !

const maintenance = ((req,res,next)=>{
    
    let isUnderMaintenance = process.env.MAINTENANCE_MODE.toLowerCase().includes('yes') ? true : false;

    if(isUnderMaintenance)
        res.status(503).render("maintenance.hbs");
    else
        next();
})

module.exports = maintenance;