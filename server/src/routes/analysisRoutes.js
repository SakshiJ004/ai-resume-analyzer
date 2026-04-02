const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { analyzeResumeController, getAnalysis, improveResumeController } = require('../controllers/analysisController');
const router = express.Router();

router.use(protect);
router.post('/analyze', analyzeResumeController);
router.get('/:resumeId', getAnalysis);
router.post('/improve', improveResumeController);

module.exports = router;