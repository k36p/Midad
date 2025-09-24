const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ]
}); 
module.exports = mongoose.model('Bookmark', BookmarkSchema);