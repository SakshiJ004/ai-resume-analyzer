const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    uploadResume,
    getUserResumes,
    getResumeById,
    deleteResume,
} = require('../controllers/resumeController');

const router = express.Router();

router.use(protect); // All resume routes are protected

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/all', getUserResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

module.exports = router;