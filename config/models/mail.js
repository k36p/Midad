const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
    email: {  
        type: String,
        required: true,
        unique: true
    },
    content: {  
        type: String,   
        required: true
    },
    status:{ 
        type:String,
        default:"inlist"
    }
},{
    timestamps: true 
});

module.exports = mongoose.model('mail', mailSchema);