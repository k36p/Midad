const express = require('express');
const router = express.Router();
const { convert, sizes } = require('image-to-pdf');
const fs = require('fs')
const multer = require('multer');
const { PDFDocument } = require('pdf-lib'); 

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
    },
 fileFilter: (req, file, cb) => {
        // Accept only PNG and JPEG file types
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG and PNG images are allowed.'), false);
        }
    }
});

router.post('/image-to-pdf', upload.array('image',35), async (req, res) => {

 if(req.files.length === 1){
    try{
   const pages = [req.files[0].buffer];
   const name = "Midad"+req.files[0].originalname.split('.')[0];
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${name || "Midad-output"}.pdf"`);
        convert(pages, sizes.A4).pipe(res);
         }catch(err){
          console.error("Error during single PDF conversion:", err);
            res.status(500).send("Error processing the image.");
        }
 } else if(req.files.length > 1){
     try{

      const pdfBuffers = await Promise.all(
            req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const pdfStream = convert([file.buffer], sizes.A4);
                    const chunks = [];

                    pdfStream.on('data', chunk => {
                        chunks.push(chunk);
                    });

                    pdfStream.on('end', () => {
                        resolve(Buffer.concat(chunks));
                    });

                    pdfStream.on('error', err => {
                        reject(err);
                    });
                });
            })
        );
       
      // 2. Merge the PDF buffers using pdf-lib
        try {
            // Create a new empty PDF document (the merged container)
            const mergedPdf = await PDFDocument.create();

            for (const buffer of pdfBuffers) {
                // Load the current individual PDF buffer
                const pdf = await PDFDocument.load(buffer);
                
                // Copy all pages from the current PDF into the merged document
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                
                // Add the copied pages to the merged document
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });
            }

            // Serialize the merged document into a final Buffer
            const mergedPdfBuffer = await mergedPdf.save();

            // 3. Send the response
            const name = "Midad-merged-output";
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${name}.pdf"`);
            res.send(Buffer.from(mergedPdfBuffer)); // Ensure it's sent as a Node.js Buffer

            console.log("All images converted and merged successfully using pdf-lib.");

        } catch (err) {
            console.error("Error during PDF merging with pdf-lib:", err);
            res.status(500).send("Error processing or merging PDFs.");
        }
 }catch(err){
          console.error("Error during single PDF conversion:", err);
            res.status(500).send("Error processing the image.");
        }  
            //way 2 : each file in separate file
 }

  
});
module.exports = router;