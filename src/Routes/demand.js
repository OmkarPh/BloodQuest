const express = require('express');
const router = express.Router();
const auth = require('./../Middleware/auth');
const User = require('./../../Models/User');
const District = require('./../../Models/District');
const getCompatibles = require('./../Modules/bloodCompatibility');
const {requestBlood} = require('./../Modules/mailer');


router.get("/request", (req,res)=>{
    let personalisation = {};
    if(req.isPersonalised)
        personalisation = {
            loggedIn: true,
            name: req.user.firstName,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            phone: req.user.phone,
            whatsapp: req.user.whatsapp,
            bloodType: req.user.bloodType,
            district: req.user.district
        }
    return res.render("request.hbs", personalisation);
})

let bloodTypes = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
router.post('/demandBlood', auth(), async (req, res)=>{
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

    res.send("We have sent requests to people with following compatible blood groups "+compatibleTypes);

    let dist = await District.aggregate([
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

    for(let i=0; i<dist[0].bloods.length; i++)
        await User.populate(dist[0], {path: "bloods."+i+".people"});

    let compatibleDonors = dist[0].bloods;

    req.body.bloodType = bloodTypes[req.body.bloodType];

    // Mail everyone
    compatibleDonors.forEach(people => requestBlood(people, req.body));


})




module.exports = router;