const express = require('express');
const { body } = require('express-validator');
const { getUsers, updateUserRole } = require('../controllers/userController');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/users', adminAuth, getUsers);
router.put('/users/:id/role', adminAuth, [ body('role').isIn(['user','admin']) ], updateUserRole);

module.exports = router;
