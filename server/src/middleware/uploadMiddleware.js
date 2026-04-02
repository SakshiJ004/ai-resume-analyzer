const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Correct absolute path to uploads folder
const uploadPath = path.join(__dirname, '../../uploads');

// Create folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('✅ uploads/ folder created at:', uploadPath);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath); // ✅ use absolute path
    },
    filename: (req, file, cb) => {
        const uniqueName = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
});

module.exports = upload;