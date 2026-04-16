import express from "express";
import {
  studyPlan,
  saveStudySubtopic,
  preEval,
  topicContent,
  topicQuiz,
  finalQuiz,
  finalReport,
  evaluateAndRegenerate
} from "../controllers/geminiController.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/study-plan", verifyJWT, studyPlan);
router.post("/study-plan/:id/subtopic", verifyJWT, saveStudySubtopic);
router.post("/pre-eval", verifyJWT, preEval);
router.post("/topic-content", verifyJWT, topicContent);
router.post("/topic-quiz", verifyJWT, topicQuiz);
router.post("/final-quiz", verifyJWT, finalQuiz);
router.post("/final-report", verifyJWT, finalReport);

router.post("/evaluate", verifyJWT, evaluateAndRegenerate);

export default router;