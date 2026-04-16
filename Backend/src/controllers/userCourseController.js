import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { UserCourse } from '../models/courses.model.js';

const createUserCourse = asyncHandler(async (req, res) => {
  const { title, difficulty, category, subject, description, thumbnail } = req.body;

  if (!title) {
    throw new ApiError(400, 'Course title is required');
  }

  const existingCourse = await UserCourse.findOne({
    user: req.user._id,
    $or: [{ title }, { goal: title }]
  });
  if (existingCourse) {
    throw new ApiError(409, 'Course already exists');
  }

  const course = await UserCourse.create({
    user: req.user._id,
    title,
    goal: title,
    category: category || subject || '',
    difficulty: difficulty || 'Intermediate',
    description: description || '',
    thumbnail: thumbnail || '',
    studyPlans: [],
    progress: 0,
    initialScore: 0
  });

  return res.status(201).json(new ApiResponse(201, course, 'Course saved successfully'));
});

const getUserCourses = asyncHandler(async (req, res) => {
  const courses = await UserCourse.find({ user: req.user._id })
    .populate('studyPlans')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, courses, 'User courses fetched successfully'));
});

const getUserCourseById = asyncHandler(async (req, res) => {
  const course = await UserCourse.findOne({ _id: req.params.id, user: req.user._id })
    .populate({ path: 'studyPlans', options: { sort: { createdAt: -1 } } });

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  return res.status(200).json(new ApiResponse(200, course, 'Course fetched successfully'));
});

export { createUserCourse, getUserCourses, getUserCourseById };