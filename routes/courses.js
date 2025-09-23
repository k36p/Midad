const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Specialization = require('../models/CourseSpecializations');
require('dotenv').config();
const multer = require('multer');
const {Poppler} = require("node-poppler");
const {pdfToPng} = require('pdf-to-png-converter');
const AccessPanel = require('../middlewares/access');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
    },
    // fileFilter: (req, file, cb) => {
    //     if (file.mimetype === 'application/pdf') {
    //         cb(null, true);
    //     } else {
    //         cb(new Error('Only PDF files are allowed'), false);
    //     }
    // }
});

// Initialize ImageKit --> remove it for  middleware 
var ImageKit = require("imagekit");
var imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});


// @GET all courses
router.get('/courses', async (req, res) => {
    try {
        const books = await Course.find({}).populate('specialization', 'name').lean();
        res.json(books); 
    } catch (err) {
        console.error('Error fetching all books:', err);
        res.status(500).json({
            error: true,
            message: 'فشل في جلب الكتب.'
        });
    }
});

// @POST new courses
router.post('/courses',AccessPanel, upload.single('file'), async (req, res) => {
    try {
        // Basic validation: Check if a file was actually uploaded
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded.'
            });
        }

        // Basic validation: Check if specializationId exists in req.body
        if (!req.body.specializationId) {
            return res.status(400).json({
                error: 'specializationId is missing in the form data.'
            });
        }

        // Validate required fields
        if (!req.body.name || req.body.name.trim() === '') {
            return res.status(400).json({
                error: 'Name is required.'
            });
        }

        // Upload PDF to ImageKit
        const uploadResult = await imagekit.upload({
            file: req.file.buffer,
            fileName: `Kurt-CDN-${req.file.originalname}`,
            folder: `university/books/${req.body.specializationId}`,
            isPrivateFile: false,
        });

        // Create PDF file cover
        let finalCoverImageUrl = null;

        try {

            const pngPages = await pdfToPng(req.file.buffer, {
                disableFontFace: true,
                useSystemFonts: true,
                enableXfa: true,
                viewportScale: 2.0,
                outputFolder: undefined,
                outputFileMaskFunc: (pageNumber) => `page_${pageNumber}.png`,
                pagesToProcess: [1],
                strictPagesToProcess: false,
                verbosityLevel: 5,
            });

            if (pngPages && pngPages.length > 0) {
                const coverResult = await imagekit.upload({
                    file: pngPages[0].content,
                    fileName: `Kurt-CDN-Cover-${req.file.originalname}`,
                    folder: `university/covers/${req.body.specializationId}`,
                    isPrivateFile: false,
                });
                finalCoverImageUrl = coverResult.url;
            }
        } catch (coverError) {
            console.error("Cover generation failed:", coverError);
        }

        if (!finalCoverImageUrl) {
            finalCoverImageUrl = 'https://dummyimage.com/360x660?text=bookImage';
        }

        // Extract form data
        const {name,specializationId,description} = req.body;

        // Create new book
        const newBook = new Course({
            name: name.trim(),
            specialization: specializationId,
            description: (description && description.trim() !== '') ? description.trim() : undefined,
            syllabusPdfUrl: uploadResult.url,
            courseImageUrl: finalCoverImageUrl
        });

        // Save to database
        await newBook.save();

        // Send success response
        res.status(201).json({
            message: 'تمت إضافة المادة بنجاح',
            course: newBook
        });

    } catch (error) {
        console.error('Error during file upload or ImageKit operation:', error);

        // Handle specific error types
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File size too large. Maximum 10MB allowed.'
            });
        }

        if (error.message && error.message.includes('Only PDF files are allowed')) {
            return res.status(400).json({
                error: 'Only PDF files are allowed.'
            });
        }

        // Provide a more specific error message based on the error object if possible
        if (error.message) {
            return res.status(500).json({
                error: `File upload failed: ${error.message}`
            });
        }

        return res.status(500).json({
            error: 'An unexpected error occurred during file upload.'
        });
    }
});


// @GET courses search
router.get('/courses/search', async (req, res) => {
    try {
        const { name, college, specialization } = req.query;

        const query = {};

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        if (specialization && specialization !== '0') {
            query.specialization = specialization;
        } 
        
        if (college && college !== '0') {

            const specializations = await Specialization.find({ college: college });
            const specializationIds = specializations.map(spec => spec._id);
            query.specialization = { $in: specializationIds };

        }

        const courses = await Course.find(query).populate('specialization');

        if (!courses || courses.length === 0) {
            return res.status(404).json({
                error: false,
                message: 'لا توجد نتائج بحث',
                data: []
            });
        }

        const formattedCourses = courses.map(course => ({
            _id: course._id,
            name: course.name,
            cover: course.courseImageUrl,
            views: course.views,
            specializationId: course.specialization._id,
            specializationName: course.specialization.name
        }));

        return res.status(200).json({
            data: formattedCourses
        });

    } catch (err) {
        console.error('Search error:', err);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(500).json({
                error: true,
                message: 'فشل في البحث عن الكتب.'
            });
        } else {
            res.redirect('/library');
        }
    }
});

// @POST course update
router.post('/course/update',AccessPanel, upload.single('courseFile'), async (req, res) => {
  
    try {

        switch (req.body.contentType) {

            case "link-group":
              
                const newGroupLink = {
                    platform:req.body.groupType,
                    title: req.body.linkTitles[0],
                    url: req.body.linkUrls[0]
                };

                Course.findByIdAndUpdate(
                        req.body.courseId, {
                            $push: {
                                groupLinks: newGroupLink
                            }
                        }, {
                            new: true
                        } 
                    )
                    .then(updatedCourse => {
                        console.log('Group link added successfully:', updatedCourse);
                    })
                    .catch(err => {
                        console.error('Error adding Group link:', err);
                    });
                break;

            case "youtube-link":

                const newYoutubeLink = {
                    title: req.body.videoTitle,
                    url: req.body.youtubeUrl
                };

                Course.findByIdAndUpdate(
                        req.body.courseId, {
                            $push: {
                                youtubeLinks: newYoutubeLink
                            }
                        }, {
                            new: true
                        } // Returns the updated document
                    )
                    .then(updatedCourse => {
                        console.log('YouTube link added successfully:', updatedCourse);
                    })
                    .catch(err => {
                        console.error('Error adding YouTube link:', err);
                    });
                break;

            case "file":
               
                 // Upload PDF to ImageKit
        const uploadResult = await imagekit.upload({
            file: req.file.buffer,
            fileName: `Kurt-CDN-${req.file.originalname}`,
            folder: `university/additionalFiles/`,
            isPrivateFile: false,
        });
      
                const newFile = {
                   fileName: req.body.fileTitle || req.file.originalname,
                   fileUrl:uploadResult.url,
                   fileType: req.body.fileType,
                };


                Course.findByIdAndUpdate(
                        req.body.courseId, {
                            $push: {
                                additionalFiles: newFile
                            }
                        }, {
                            new: true
                        } // Returns the updated document
                    )
                    .then(updatedCourse => {
                        console.log('file added successfully:', updatedCourse);
                    })
                    .catch(err => {
                        console.error('Error adding file:', err);
                    });
                break;
            default:
                break;
        }

        res.redirect('/new-course');

    } catch (err) {
        console.error('Search error:', err);

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(500).json({
                error: true,
                message: 'فشل'
            });
        } else {
            res.redirect('/new-course');
        }
    }
});


// @GET get course data from dashboard
router.get('/data/:id',AccessPanel, async (req, res) => {

    if(!req.params.id){
        res.redirect("/library")
        return;
    }
    
    try {

        const courseId = req.params.id; 

        const courseData = await Course.findById(courseId).populate('specialization').lean();
        
        res.json(courseData);

    } catch (error) {
        console.error('Error fetching course data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @POST for edit course from dashboard

router.post('/course/update/:id', AccessPanel, async (req, res) => {

    const { name, specialization } = req.body;
    const courseId = req.params.id;

    if (!courseId) {
        return res.redirect("/dashboard");
    }

    
    if (!name && !specialization) {
        return res.status(400).json({ message: "Name or specialization is required." });
    }
    
    if (name.trim() === '') {
                return res.status(400).json({ message: "Name cannot be empty." });
            }

    try {
 
        const courseData = await Course.findById(courseId);

        if (!courseData) {
            return res.status(404).json({ message: "Course not found." });
        }

        courseData.name = name;
        courseData.specialization = specialization;

        await courseData.save();

        res.status(200).json({ message: "تم تحديث معلومات المادة بنجاح" });

    } catch (error) {
        console.error('Error updating course data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;