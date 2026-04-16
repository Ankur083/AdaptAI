import mongoose from "mongoose";

const videoLectureSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  url: {
    type: String,
    default: ""
  },
  duration: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  }
}, { _id: false });

const documentationSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  url: {
    type: String,
    default: ""
  },
  summary: {
    type: String,
    default: ""
  }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ""
  },
  options: {
    type: [String],
    default: []
  },
  correctAnswer: {
    type: Number,
    min: 0,
    max: 3,
    default: 0
  },
  explanation: {
    type: String,
    default: ""
  }
}, { _id: false });

const subTopicSchema = new mongoose.Schema({
  subtopicId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending"
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner"
  },
  order: {
    type: Number,
    default: 0
  },
  videoLectures: {
    type: [videoLectureSchema],
    default: []
  },
  documentation: {
    type: [documentationSchema],
    default: []
  },
  questions: {
    type: [questionSchema],
    default: []
  },
  weakTags: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const studyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserCourse"
  },
  planTitle: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: ""
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Intermediate"
  },
  prerequisites: {
    type: [String],
    default: []
  },
  subTopics: {
    type: [subTopicSchema],
    default: []
  },
  status: {
    type: String,
    enum: ["active", "archived", "completed"],
    default: "active"
  }
}, { timestamps: true });

const userCourseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  goal: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: ""
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Intermediate"
  },
  description: {
    type: String,
    default: ""
  },
  thumbnail: {
    type: String,
    default: ""
  },
  studyPlans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyPlan"
    }
  ],
  progress: {
    type: Number,
    default: 0
  },
  initialScore: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export const UserCourse = mongoose.model("UserCourse", userCourseSchema);
export const StudyPlan = mongoose.model("StudyPlan", studyPlanSchema);

