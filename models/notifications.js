const mongoose = require('mongoose');

const notificationsSchema = new mongoose.Schema({
    content: {  
        type: String,
        required: true,
    },
    media: {  
        type: String,   
        required: false
    },
    type:{
        type: String,
        required: true,
    },
    specialization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialization',
        required: false
    }
},{
    timestamps: true 
});

module.exports = mongoose.model('notifications', notificationsSchema);