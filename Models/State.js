const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    stateName:{
        type: String,
        required: true
    },
    districts:[{
        districtName: String,
        districtID:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'district'
        }    
    }]
})

const State = new mongoose.model('State',stateSchema);

// let maha = new State({
//     stateName:"Maharashtra",
//     districts:[
//         {districtName:"Mumbai", districtID:"5f70808a1e48e705045e9a8d"}
//     ]
// })
// maha.save();

module.exports = State;