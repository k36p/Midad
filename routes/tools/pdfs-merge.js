const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');

// Configure multer to handle file uploads
// Note: We are now accepting 'application/pdf' files.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // Increased limit to 50MB for larger PDF files
    },
    fileFilter: (req, file, cb) => {
        // Accept only PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed.'), false);
        }
    }
});

// A new route to handle PDF merging.
// It accepts up to 35 PDF files with the field name 'pdf'.
router.post('/pdfs-merge', upload.array('pdf', 35), async (req, res) => {

    // Check if any files were uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No PDF files were uploaded.');
    }

    try {
        // Create a new, empty PDF document to hold the merged content
        const mergedPdf = await PDFDocument.create();

        // Loop through each uploaded PDF file buffer
        for (const file of req.files) {
            // Load the current PDF file from its buffer
            const pdf = await PDFDocument.load(file.buffer);

            // Copy all pages from the loaded PDF into the merged document
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

            // Add the copied pages to the merged PDF
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }

        // Serialize the merged document into a Buffer
        const mergedPdfBuffer = await mergedPdf.save();

        // Set the response headers for a PDF download
        const name = "Midad-merged-output";
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${name}.pdf"`);

        // Send the final merged PDF buffer as the response
        res.send(Buffer.from(mergedPdfBuffer));

        console.log("PDFs merged successfully.");

    } catch (err) {
        console.error("Error during PDF merging:", err);
        // Provide a more user-friendly error message
        res.status(500).send("Error processing and merging the PDF files.");
    }
});

module.exports = router;