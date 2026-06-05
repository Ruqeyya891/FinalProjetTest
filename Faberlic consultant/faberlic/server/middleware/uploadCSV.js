const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadCSV = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /csv|text\/csv/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype || extname || file.originalname.toLowerCase().endsWith('.csv')) {
            return cb(null, true);
        }
        cb(new Error("Yalnız CSV faylları yüklənə bilər!"));
    }
});

module.exports = uploadCSV;