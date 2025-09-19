
const express = require('express');
const router = express.Router();  
const Mail = require('../models/mail');  

 function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// @POST for recive new email 
router.post('/mail', async (req, res) => {
    try { 

        const { email , content } = req.body;
 
        if (!email || email.trim() === '') {
            return res.status(400).json({ error: true, message: 'البريد  الإلكتروني مطلوب' });
        }
 
        if(isValidEmail(email) === false){
            return res.status(400).json({ error: true, message: 'البريد  الإلكتروني غير صحيح' });
        }

        const newMail = new Mail({ email , content });
 
        await newMail.save();
 
        res.status(201).json({ message: 'تم إرسال الرسالة بنجاح إنتظر الرد عير البريد الإلكتروني' });

    } catch (err) {
         console.error('Error adding college:', err); 
         if(err.code === 11000){
            res.status(500).json({message: 'هنالك رسالة حالية من نفس البريد  الألكتروني، إنتظر حتى يتم الرد عليها قبل الإرسال مرة أخرى'});
         }else{
            res.status(500).json({message: 'فشل في إرسال الرسالة، حاول لاحقا'});
         }
      
    }
});
 

module.exports = router; 