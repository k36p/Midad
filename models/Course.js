const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
        unique: true 
    },
    specialization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialization',
        required: true
    },
    description: { 
        type: String
    },
    syllabusPdfUrl: { 
        type: String,
        trim: true
    },
    courseImageUrl: { 
        type: String,
        trim: true
    },  
    youtubeLinks: [{ 
        title: { type: String, trim: true }, 
        url: { type: String, required: true, trim: true } 
    }],
    groupLinks: [{ 
        platform: { type: String, trim: true }, 
        title: { type: String, trim: true }, 
        url: { type: String, required: true, trim: true } 
    }],
    additionalFiles: [{ 
        fileName: { type: String, required: true, trim: true }, 
        fileUrl: { type: String, required: true, trim: true }, 
        fileType: { type: String, trim: true }, 
        description: { type: String, trim: true } 
    }],
    views:{
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Course', bookSchema);