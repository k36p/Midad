const mongoose = require('mongoose');

const specializationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    }
});

module.exports = mongoose.model('Specialization', specializationSchema);