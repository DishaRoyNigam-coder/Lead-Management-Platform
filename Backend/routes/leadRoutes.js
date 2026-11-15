const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getLeads, createLead, updateLead, deleteLead } = require('../controllers/leadController');

// All lead routes require authentication
router.route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router.route('/:id')
  .put(protect, updateLead)
  .delete(protect, deleteLead);

module.exports = router;