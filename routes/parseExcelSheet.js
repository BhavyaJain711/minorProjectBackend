import express from 'express';
import multer from 'multer';
import { parseExcelSheet } from '../controllers/parseExcelSheet.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Excel files are allowed.'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Route for uploading and parsing Excel sheet
router.post('/upload', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const parsedData = await parseExcelSheet(req.file.buffer);
        res.json({
            success: true,
            data: parsedData
        });
    } catch (error) {
        console.error('Error processing Excel file:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

export default router; 