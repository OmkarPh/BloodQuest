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


module.exports = State;