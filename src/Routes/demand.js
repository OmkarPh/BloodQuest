const express = require('express');
const router = express.Router();
const auth = require('./../Middleware/auth');
const User = require('./../../Models/User');
const District = require('./../../Models/District');
const getCompatibles = require('./../Modules/bloodCompatibility');
const {requestBlood} = require('./../Modules/mailer');


router.get('/demand', auth(), (req,res)=>{
    res.render('request.hbs');
})

router.post('/demandBlood', auth(), async (req, res)=>{

    // Process the needs
    const demand = {
        ...req.body,
    };
    
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


    compatibleDonors.forEach(people => requestBlood(people, req.body));

    // Mail everyone

})




module.exports = router;