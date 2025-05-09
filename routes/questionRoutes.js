import express from 'express';
import { generateQuestionsByTopic } from '../controllers/questionController.js';

const router = express.Router();

router.get('/generate', generateQuestionsByTopic); // /api/questions/generate?topic=deportes

export default router;
