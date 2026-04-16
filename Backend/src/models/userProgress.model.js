import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  quizId: {
    type: String,
    default: null
  },

  topic: {
    type: String,
    required: true,
    index: true
  },

  subCategory: {
    type: String,
    required: true,
    index: true
  },

  subSubCategory: {
    type: String,
    default: null,
    index: true
  },

  tags: {
    type: [String],
    default: []
  },

  answers: {
    type: [
      {
        questionId: String,
        questionText: String,
        selectedOption: Number,
        correctAnswer: Number,
        isCorrect: Boolean,
        tags: [String],
        subCategory: String,
        subSubCategory: String,
        answeredAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },

  wrongConcepts: {
    type: [String],
    default: []
  },

  wrongAnswers: {
    type: [
      {
        questionId: String,
        questionText: String,
        selectedOption: Number,
        correctAnswer: Number,
        tags: [String],
        subCategory: String,
        subSubCategory: String,
        answeredAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },

  wrongHistory: {
    type: [
      {
        topic: String,
        subCategory: String,
        subSubCategory: String,
        tag: String,
        wrongCount: {
          type: Number,
          default: 0
        },
        lastWrongAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },

  conceptStats: {
    type: Map,
    of: {
      correct: Number,
      wrong: Number
    },
    default: {}
  },

  score: {
    type: Number,
    default: 0
  },

  total: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserProgress = mongoose.model("UserProgress", userProgressSchema);
export default UserProgress;