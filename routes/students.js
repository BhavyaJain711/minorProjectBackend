import express from 'express';
import { fetchSubjectStudents, fetchStudentDetails } from '../controllers/dataService.js';

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    req.token = token;
    next();
};

// Get all students for a specific subject
router.get('/subject/:subjectId', async (req, res) => {
    try {
        const { subjectId } = req.params;
        const result = await fetchSubjectStudents(subjectId, req.token);
        res.json(result);
    } catch (error) {
        console.error('Error in subject students route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get details of a specific student
router.get('/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const token=req.header("Authorization");
        const result = await fetchStudentDetails(studentId, token);
        res.json(result);
    } catch (error) {
        console.error('Error in student details route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router; 