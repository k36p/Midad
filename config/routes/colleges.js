const express = require('express');
const router = express.Router();  
const College = require('../models/CourseCollege');   
const messages = require('../config/msg.json');
const AccessPanel = require('../middlewares/access');

// @POST new colleges
router.post('/colleges', async (req, res) => {
    try {
 
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: true, message: messages.ar.COLLEGE_NAME_REQUIERD });
        }

        const existingCollege = await College.findOne({ name: name.trim() });
        if (existingCollege) {
            return res.status(409).json({ error: true, message: messages.ar.COLLEGE_ALREDY_CREATED });
        }

        const newCollege = new College({ name: name.trim() });
        await newCollege.save();

        res.status(201).json({ message: messages.ar.COLLEGE_CREATED_SUCCESFULLY , college: newCollege });

    } catch (err) {
     
        console.error('Error adding college:', err);n
        res.status(500).json({ error: true, message: messages.ar.COLLEGE_CREATE_FAILED, details: err.message });
    }
});
 
// @GET all colleges stored in database
router.get('/colleges', async (req, res) => {
    try {
        const colleges = await College.find();  
        res.json(colleges);  
    } catch (err) {
        console.error('Error fetching colleges:', err);  
        res.status(500).json({ error: true, message: messages.ar.COLLEGE_COLLECT_FROM_SERVER_ERROR });
    }
});

// @GET data about specific college
router.get('/data/college/:id',AccessPanel, async (req, res) =>{
    try {
        const id = req.params.id;
        const college = await College.findById(id);
        res.json(college);
    }catch (err) {
        console.error('Error fetching college data:', err);
        res.status(500).json({ error: true, message: messages.ar.COLLEGE_COLLECT_FROM_SERVER_ERROR });
    }
})

// @POST college update data 
router.post('/college/update/:id',AccessPanel, async (req, res) => {
    try {
        const id = req.params.id;
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: true, message: "لايمكن ان يكون الاسم فارغا" });
        }

        const updatedCollege = await College.findByIdAndUpdate(id, { name: name.trim() }, { new: true });
        if (!updatedCollege) {
            return res.status(404).json({ error: true, message: messages.ar.COLLEGE_NOT_FOUND });
        }

        res.json({ message: messages.ar.COLLEGE_UPDATED_SUCCESSFULLY, college: updatedCollege });
    } catch (err) {
        console.error('Error updating college:', err);
        res.status(500).json({ error: true, message: "error update college" });
    }
});

module.exports = router;  