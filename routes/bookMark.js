
const express = require('express');
const router = express.Router();  
const bookMark = require('../models/Booksmark');  
const Course = require('../models/Course');
const messages = require('../config/msg.json');


// save new book mark --> need for authourization and compair user 
router.post('/bookMark/:userId/:courseId', async (req, res) => {
    try { 

        let  userId = req.params.userId;
        let courseId = req.params.courseId;

        if (!userId) {
            return res.status(400).json({ error: true, message: messages.ar.USERNAME_REQUIERD });
        }

        if (!courseId) {
            return res.status(400).json({ error: true, message: messages.ar.COURSE_ID_REQUIERD });
        }

        let course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ error: true, message: messages.ar.UNDEFIEND_COURSE });
        }

        let data = await bookMark.findOne({user_id: userId})
        

        if (data && data.course_id.includes(courseId)) {
                await bookMark.findOneAndUpdate({
                user_id: userId
            }, {
                $pull: {
                course_id: courseId 
        }
            }, {
                new: true,
                upsert: true
          });
            return res.status(200).json({ message: messages.ar.SUCCESS_UN_BOOK_MARK , action: "remove"});
     }else{
              await bookMark.findOneAndUpdate({
                user_id: userId
            }, {
                $push: {
                course_id: courseId 
        }
            }, {
                new: true,
                upsert: true
          });
            return res.status(200).json({ message: messages.ar.SUCCESS_BOOK_MARK , action: "added" });
     }

  } catch (err) {
         console.error('Error adding :', err); 
         res.status(500).json({message: messages.ar.SERVER_ERROR});
    }
});

 // un book mark --> need for authourization and compair user 
 router.post('/bookMark/remove/:userId/:courseId', async (req, res) => {

 try { 

        let  userId = req.params.userId;
        let courseId = req.params.courseId;

        if (!userId) {
            return res.status(400).json({ error: true, message: messages.ar.USERNAME_REQUIERD});
        }

        if (!courseId) {
            return res.status(400).json({ error: true, message: messages.ar.COURSE_ID_REQUIERD });
        }

        let course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ error: true, message: messages.ar.UNDEFIEND_COURSE });
        }

        let data = await bookMark.findOne({user_id: userId})
        

        if (data && data.course_id.includes(courseId)) {
                await bookMark.findOneAndUpdate({
                user_id: userId
            }, {
                $pull: {
                course_id: courseId
        }
            }, {
                new: true,
                upsert: true
          });
            return res.status(200).json({ message: messages.ar.SUCCESS_UN_BOOK_MARK , action: "remove"});
     }else{
            return res.status(200).json({ message: messages.ar.NOT_BOOK_MARK_COURSE , action: "not_found" });
     }

    } catch (err) {
         console.error('Error:', err); 
         res.status(500).json({message: messages.ar.ERROR_UN_BOOK_MARK});
    }

 })

// get data about users all books marked --> need for authourization and compair user 
 router.get('/booksMark/:userId/:courseId', async (req, res) => {
        
     try{
      
        let  userId = req.params.userId;
        let courseId = req.params.courseId;

        if (!userId) {
            return res.status(400).json({ error: true, message: messages.ar.USERNAME_REQUIERD });
        }

        if (!courseId) {
            return res.status(400).json({ error: true, message: messages.ar.COURSE_ID_REQUIERD });
        }

        let course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ error: true, message: messages.ar.UNDEFIEND_COURSE });
        }

        let data = await bookMark.findOne({user_id: userId})
        

        if (data && data.course_id.includes(courseId)) {
            return res.status(200).json({status:true});
     }else{
            return res.status(200).json({status:false});
     }
    }catch(err){
         console.error('Error fetching bookmarks:', err);
         res.status(500).json({ message: messages.ar.ERROR_LOAD_BOOK_MARK });
     }

 })

module.exports = router; 