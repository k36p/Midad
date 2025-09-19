const express = require('express');
const router = express.Router();
const Specialization = require('../models/CourseSpecializations') 
const College = require('../models/CourseCollege');  
const messages = require('../config/msg.json');
const AccessPanel = require('../middlewares/access');

// @POST new specialization
router.post('/specializations',AccessPanel, async (req, res) => {
    try {
        const { name, collegeId } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: true, message: messages.ar.SPECIALIZATION_NAME_REQUIERD });
        }
        if (!collegeId || collegeId.trim() === '') {
            return res.status(400).json({ error: true, message: messages.ar.SPECIALIZATION_COLLEGE_REQUIERD });
        }

        const existingCollege = await College.findById(collegeId);
        if (!existingCollege) {
            return res.status(404).json({ error: true, message: messages.ar.UNDEFIEND_COLLEGE });
        }

         const existingSpecialization = await Specialization.findOne({ name: name.trim() });
         if (existingSpecialization) {
             return res.status(409).json({ error: true, message: messages.ar.SPECIALIZATION_ALREDY_CREATED });
         }

        const newSpecialization = new Specialization({
            name: name.trim(),
            college: collegeId  
        });
 
        await newSpecialization.save();
 
        res.status(201).json({ message: messages.ar.SPECIALIZATION_CREATED_SUCCESFULLY, specialization: newSpecialization });

    } catch (err) {
        console.error('Error adding specialization:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: true, message: err.message });
        }
        res.status(500).json({ error: true, message: messages.ar.SPECIALIZATION_FAILD_CREATE, details: err.message });
    }
});

// @GET all
router.get('/specializations/all', async (req, res) => {
    try {
        
        const specializations = await Specialization.find({}).lean(); 
        res.json(specializations); 

    } catch (err) {
        console.error('Error fetching all specializations:', err);
        res.status(500).json({ error: true, message: messages.ar.SPECIALIZATION_COLLECT_FROM_SERVER_ERROR });
    }
});


// @GET  specific college specializations
router.get('/specializations/:college', async (req, res) => {
    try {

        const collegeId = req.params.college;
    
        const specializations = await Specialization.find({ college: collegeId }).lean();

        if (specializations.length === 0) {
            return res.status(404).json({ message: messages.ar.NO_SPECILIZATIONS_FOR_COLLEGE });
        }
        
        res.json(specializations);

    } catch (err) {
        console.error('Error fetching specializations for college:', err);
        res.status(500).json({ error: true, message: messages.ar.SPECIALIZATIONS_FETCH_ERROR});
    }
});

// @GET specialization data
router.get('/data/specialization/:id',AccessPanel, async (req, res) => {
try{
    const specializationId = req.params.id;
    const specialization = await Specialization.findById(specializationId).lean();
    res.json(specialization);
}catch(err){
    console.error('Error fetching specialization data:', err);
    res.status(500).json({ error: true, message: messages.ar.SPECIALIZATION_DATA_FETCH_ERROR });
}
})

// @POST update specilization data
router.post('/specialization/update/:id', async (req, res) => {

        const { name, college } = req.body;
        const specializationId = req.params.id;

        if (!specializationId) {
            return res.redirect("/dashboard");
        }
    
        
        if (!name && !college) {
            return res.status(400).json({ message: messages.ar.NAME_COLLEGE_REQUIERD });
        }
            if (name.trim() === '') {
                return res.status(400).json({ message: messages.ar.SPECIALIZATION_NAME_REQUIERD });
            }
            const specializationData = await Specialization.findById(specializationId);

            if (!specializationData) {
                return res.status(404).json({ message: messages.ar.UNDEFIEND_SPECILIZATION });
            }
        try {
            specializationData.name = name;
            specializationData.college = college;

            await specializationData.save();

            res.status(200).json({ message: messages.ar.SPECIALIZATION_UPDATED_SUCCESSFULLY });

    } catch (err) {
        console.error('Error updating specialization:', err);
        res.status(500).json({ error: true, message: messages.ar.SPECIALIZATION_UPDATE_FAIL });
    }
})

module.exports = router;