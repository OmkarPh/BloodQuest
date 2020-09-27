const mongoose = require('mongoose');

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

const District = new mongoose.model('district', districtSchema);

// let mum = new District({
//     name: "Mumbai",
//     bloods:[
//         {name:"A+",people:[]},
//         {name:"A-+",people:[]},
//         {name:"B+",people:[]},
//         {name:"B-",people:[]},
//         {name:"O+",people:["5f7041018540ff2644a5d18f"]},
//         {name:"O-",people:[]},
//         {name:"AB+",people:[]},
//         {name:"AB-",people:[]}
//     ]
// });
// mum.save();
// District.findById("5f70808a1e48e705045e9a8d", async (err, dst)=>{
//     await dst.populate('bloods.4.people').execPopulate();
//     console.log(dst.bloods[4].people);
// })


module.exports = District;