const express = require('express');
const router = express.Router();
const auth = require('./../Middleware/auth');
const User = require('./../../Models/User');
const District = require('./../../Models/District');
const getCompatibles = require('./../Modules/bloodCompatibility');



router.get('/demand', auth(), (req,res)=>{
    res.render('request.hbs');
})

router.post('/demandBlood', auth(), async (req, res)=>{

    // Process the needs
    const demand = {
        ...req.body,
    };

    let compatibleTypes = getCompatibles(demand.bloodType);
    // Prepare this array for $or inside $filter:
        // "$or" : [
        //     { "$eq" : [ "$$blood.name", "O+" ] },
        //     { "$eq" : [ "$$blood.name", "A+" ] }
        // ]
    demand.compatibleOperator = compatibleTypes.map(compatible => { 
        return {"$eq": ["$$blood.name", compatible]} 
    });

    res.send("We have sent requests to people with following compatible blood groups "+compatibleTypes);

    // let dist = await District.aggregate([
    //     {$match: {"name": demand.district}},
    //     {$project: {
    //         bloods: {$filter: {
    //             input: "$bloods",
    //             as:"blood",
    //             cond: {
    //                 "$or" : demand.compatibleOperator
    //              }            
    //         }}
    //     }}
    // ]);
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
    await User.populate(dist[0], {path: "bloods.0.people"});
    //dist[0].bloods[0].populate('people').execPopulate();
    console.log(dist[0].bloods[0].people);

    // Some problem here
    // let content = await dist.bloods[0].people.map(async personID =>{
    //     let demandData = {};
    //     await User.findById(personID, function (err, user) { 
    //         if (err){ 
    //             console.log(err); 
    //         } 
    //         else{ 
    //             demandData = user;
    //         } 
    //     }); 
    //     return demandData;
    // })

    // console.log(content);



    // Mail everyone

})




module.exports = router;