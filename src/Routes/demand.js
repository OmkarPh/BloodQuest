const express = require('express');
const router = express.Router();
const User = require('./../../Models/User');
const District = require('./../../Models/District');
const getCompatibles = require('./../Modules/bloodCompatibility');
const {requestBlood} = require('./../Modules/mailer');

router.get("/request", (req,res)=>{
    let personalisation = {};
    if(req.isPersonalised)
        personalisation = {...req.user._doc, loggedIn: true};

    return res.render("request.hbs", personalisation);
})

let bloodTypes = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
router.post('/demandBlood', async (req, res)=>{
    // Process the needs
    const demand = {
        ...req.body,
    };
    demand.bloodType = Number.parseInt(demand.bloodType);

    let compatibleTypes = await getCompatibles(demand.bloodType);
    // Prepare this array for $or inside $filter:
        // "$or" : [
        //     { "$eq" : [ "$$blood.name", "O+" ] },
        //     { "$eq" : [ "$$blood.name", "A+" ] }
        // ]
    demand.compatibleOperator = compatibleTypes.map(compatible => { 
        return {"$eq": ["$$blood.name", compatible]} 
    });

    res.redirect("/message?title=We have sent requests to people with compatible blood groups&description=You have been sent a copy of such email too.");

    let districts = await District.aggregate([
        {$match: {"name": demand.district}},
        {$project: {
            bloods: {$filter: {
                input: "$bloods",
                as:"blood",
                cond: {
                    "$or" : demand.compatibleOperator
                }            
            }}
        }}
    ]);
    let dist = districts[0];

    for(let i=0; i<dist.bloods.length; i++)
        await User.populate(dist, {path: "bloods."+i+".people"});

    let compatibleDonors = dist.bloods;
    req.body.bloodType = bloodTypes[req.body.bloodType];

    // Mail everyone
    compatibleDonors.forEach(people => requestBlood(people, req.body));
})


module.exports = router;