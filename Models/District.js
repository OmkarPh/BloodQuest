const mongoose = require('mongoose');
const State = require('./State');

const districtSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    bloods:[{
        name:{
            type: String
        },
        people:[{
            type: mongoose.SchemaTypes.ObjectId,
            ref:'Users'
        }]
    }]
});

// Utility function to find district
districtSchema.statics.findDistrict = async (districtName, state="Maharashtra")=>{
    if(typeof(districtName) !== "string")
        throw new Error("Invalid parameter type !");
    
    let district = await District.findOne({name: districtName});
    if(!district){
        console.log("Not found", districtName);
        district = new District({
            name: districtName,
            bloods:[
                {name:"A+",people:[]},
                {name:"A-+",people:[]},
                {name:"B+",people:[]},
                {name:"B-",people:[]},
                {name:"O+",people:[]},
                {name:"O-",people:[]},
                {name:"AB+",people:[]},
                {name:"AB-",people:[]}
            ]
        });
        await district.save();
        State.findOne({stateName: state}, (err, stateDocument)=>{
            if(err)
                return console.log("Error while adding district",districtName,"to state",state);
            stateDocument.districts.push({districtName, districtID: district._id});
            stateDocument.save();
        });
        console.log("Created ", district.name);
    }
    if(!district)
        throw new Error("Couldn't create new district !");
    return district;
}

const District = new mongoose.model('district', districtSchema);


module.exports = District;