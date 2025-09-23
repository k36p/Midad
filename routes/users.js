const express = require('express');
const router = express.Router();
require('dotenv').config();
const User = require('../models/User');
const messages = require('../config/msg.json');
const AccessPanel = require('../middlewares/access');
const OwnerOremission = require('../middlewares/owner')

// @GET user by ID from /dashboard/admins page
router.get('/data/user/:id', AccessPanel, async (req, res) => {
   const UserId = req.params.id;
   if (!UserId) {
      return res.status(500).json({
         message: messages.ar.USERNAME_REQUIERD
      })
   }

   try {
      const user = await User.findById(UserId); // get user data
      if (!user) {
         return res.status(404).json({
            message: messages.ar.UNDEFIEND_USERNAME
         });
      }
      res.json(user); // send user data
   } catch (error) {
      console.error(error);
      res.status(500).json({
         message: messages.ar.SERVER_ERROR
      });
   }
})


// @POST remove admin permissions by ID from /dashboard/admins page
router.post('/admins/update/:action/:id', OwnerOremission, async (req, res) => {
   try {
      const action = req.params.action;
      const userId = req.params.id;

     if(!userId || !action){
      return res.status(500).json({
        message: messages.ar.SOME_INFORMATION_MISSING
      });
    }

      const user = await User.findById(userId);
      if (!user) {
         return res.status(404).json({
            message: messages.ar.UNDEFIEND_USERNAME
         });
      }

      if (action === 'removePermissions') {
         user.role = 'user';
      }

      await user.save();
      res.json({
         message: messages.ar.PREMISSION_REMOVED_SUCCESSFULLY
      });
   } catch (error) {
      console.error(error);
      res.status(500).json({
         message: messages.ar.SERVER_ERROR
      });
   }
})


module.exports = router;

// @ to do:
/*
- all done
*/