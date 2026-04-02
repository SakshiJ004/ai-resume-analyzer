const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { matchJob, generateCoverLetterController } = require('../controllers/jobController');
const router = express.Router();

router.use(protect);
router.post('/match', matchJob);
router.post('/cover-letter', generateCoverLetterController);

module.exports = router;