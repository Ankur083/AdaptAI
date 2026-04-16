import UserProgress from "../models/userProgress.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const buildConceptStats = (results = []) => {
  const stats = new Map();

  results.forEach((item) => {
    const tags = Array.isArray(item.tags) ? item.tags : item.tag ? [item.tag] : [];

    tags.forEach((tag) => {
      const existing = stats.get(tag) || { correct: 0, wrong: 0 };
      if (item.isCorrect) {
        existing.correct += 1;
      } else {
        existing.wrong += 1;
      }
      stats.set(tag, existing);
    });
  });

  return Object.fromEntries(stats);
};

const buildWrongHistory = (topic, subCategory, subSubCategory, results = []) => {
  const history = new Map();

  results.forEach((item) => {
    if (item.isCorrect) return;

    const tags = Array.isArray(item.tags) ? item.tags : item.tag ? [item.tag] : ["unknown"];

    tags.forEach((tag) => {
      const key = `${topic || item.topic || "unknown"}|${subCategory || item.subCategory || "unknown"}|${subSubCategory || item.subSubCategory || "unknown"}|${tag}`;
      const existing = history.get(key) || {
        topic: topic || item.topic || "unknown",
        subCategory: subCategory || item.subCategory || "unknown",
        subSubCategory: subSubCategory || item.subSubCategory || "unknown",
        tag,
        wrongCount: 0,
        lastWrongAt: new Date()
      };

      existing.wrongCount += 1;
      existing.lastWrongAt = new Date();
      history.set(key, existing);
    });
  });

  return Array.from(history.values());
};

export const saveQuizProgress = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const {
    quizId,
    topic,
    subCategory,
    subSubCategory,
    tags,
    results,
    score,
    total,
    wrongConcepts = []
  } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!topic || !subCategory) {
    throw new ApiError(400, "topic and subCategory are required");
  }

  const normalizedResults = Array.isArray(results) ? results : [];

  const wrongAnswers = normalizedResults
    .filter((item) => item.isCorrect === false)
    .map((item) => ({
      questionId: item.questionId,
      questionText: item.questionText,
      selectedOption: item.selectedOption,
      correctAnswer: item.correctAnswer,
      tags: Array.isArray(item.tags) ? item.tags : item.tag ? [item.tag] : [],
      subCategory: item.subCategory || subCategory,
      subSubCategory: item.subSubCategory || subSubCategory,
      answeredAt: item.answeredAt ? new Date(item.answeredAt) : new Date()
    }));

  const progressEntry = await UserProgress.create({
    userId,
    quizId,
    topic,
    subCategory,
    subSubCategory,
    tags: Array.isArray(tags) ? tags : [],
    answers: normalizedResults.map((item) => ({
      questionId: item.questionId,
      questionText: item.questionText,
      selectedOption: item.selectedOption,
      correctAnswer: item.correctAnswer,
      isCorrect: Boolean(item.isCorrect),
      tags: Array.isArray(item.tags) ? item.tags : item.tag ? [item.tag] : [],
      subCategory: item.subCategory || subCategory,
      subSubCategory: item.subSubCategory || subSubCategory,
      answeredAt: item.answeredAt ? new Date(item.answeredAt) : new Date()
    })),
    wrongConcepts,
    wrongAnswers,
    wrongHistory: buildWrongHistory(topic, subCategory, subSubCategory, normalizedResults),
    conceptStats: buildConceptStats(normalizedResults),
    score: typeof score === "number" ? score : 0,
    total: typeof total === "number" ? total : normalizedResults.length
  });

  res.status(201).json({
    message: "Quiz progress recorded",
    data: progressEntry
  });
});

export const getUserProgressHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { topic, subCategory, tag } = req.query;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const filter = { userId };
  if (topic) filter.topic = topic;
  if (subCategory) filter.subCategory = subCategory;
  if (tag) filter.tags = tag;

  const history = await UserProgress.find(filter).sort({ createdAt: -1 });

  res.json({
    count: history.length,
    data: history
  });
});