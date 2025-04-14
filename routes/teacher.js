// src/routes/excelRoutes.js
import express from 'express';
import { downloadExcel } from '../controllers/excelSheet.js';

const router = express.Router();

router.get('/download-excel/:examComponentId', downloadExcel);

export default router;
