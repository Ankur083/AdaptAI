import OpenAI from "openai";
import dotenv from "dotenv";
import { UserCourse, StudyPlan } from "../models/courses.model.js";

dotenv.config();


const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});



//  Study Plan
export const studyPlan = async (req, res) => {
    try {
        const { goal, courseId, difficulty, persist = true } = req.body;
        const userId = req.user?._id;

        const response = await client.responses.create({
            model: "openai/gpt-oss-120b",
            input: `
You are an expert educator and curriculum designer.

Create a structured study plan for the learning goal: "${goal}"

### Requirements:
- Identify ONE clear main topic
- Identify ONE relevant category area (e.g., computer Science, data science, development,Marketing, design,etc)
- Provide 7-10 subtopics in a logical learning order (beginner → advanced)
- Each subtopic must include:
  - id (unique short string like "t1", "t2")
  - title (clear and concise)
  - description (1-2 lines, easy to understand on the topic)
- Include 4-5 prerequisites (basic knowledge required before starting)

### Rules:
- Keep explanations beginner-friendly
- Avoid repetition
- Maintain proper learning sequence
- Keep descriptions short and clear

### Output Format (STRICT):
- Return ONLY valid JSON
- Do NOT include any extra text, explanation, or markdown
- Do NOT wrap JSON in code blocks

{
  "topic": "string",
  "subject": "string",
  "subTopics": [
    {
      "id": "t1",
      "title": "string",
      "description": "string"
    }
  ],
  "prerequisites": ["string"]
}
`
        });

        //  Safe parsing
        let text = response.output_text?.trim();

        if (!text) {
            throw new Error("Empty response from AI");
        }

        //  Remove accidental markdown
        text = text.replace(/```json|```/g, "").trim();

        const data = JSON.parse(text);

        //  Optional validation
        if (!data.topic || !Array.isArray(data.subTopics)) {
            throw new Error("Invalid study plan format");
        }

        if (!data.prerequisites) {
            data.prerequisites = [];
        }

        let course = null;
        if (courseId) {
            course = await UserCourse.findOne({ _id: courseId, user: userId });
            if (!course) {
                throw new Error("Course not found or does not belong to the current user");
            }
        }

        if (!persist) {
            return res.status(200).json(data);
        }

        const savedPlan = await StudyPlan.create({
            user: userId,
            course: course?._id,
            planTitle: data.topic || goal,
            subject: data.subject || "",
            category: course?.category || data.subject || "",
            difficulty: difficulty || course?.difficulty || "Intermediate",
            prerequisites: data.prerequisites,
            subTopics: data.subTopics.map((subTopic, index) => ({
                subtopicId: subTopic.id || `t${index + 1}`,
                title: subTopic.title,
                description: subTopic.description || "",
                order: index + 1,
                videoLectures: [],
                documentation: [],
                questions: []
            }))
        });

        if (course) {
            course.studyPlans = course.studyPlans || [];
            course.studyPlans.push(savedPlan._id);
            await course.save();
        }

        res.status(201).json(savedPlan);

    } catch (err) {
        console.error("Study Plan Error:", err.message);

        res.status(500).json({
            message: "Failed to generate study plan",
            error: err.message
        });
    }
};

export const saveStudySubtopic = async (req, res) => {
    try {
        const userId = req.user?._id;
        const planId = req.params.id;
        const { subtopicId, status, videoLectures, documentation, questions, level, weakTags } = req.body;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        if (!planId || !subtopicId) {
            throw new Error("planId and subtopicId are required");
        }

        const plan = await StudyPlan.findOne({ _id: planId, user: userId });
        if (!plan) {
            throw new Error("Study plan not found");
        }

        const subTopic = plan.subTopics.find((item) => item.subtopicId === subtopicId || item.id === subtopicId || item._id?.toString() === subtopicId);
        if (!subTopic) {
            throw new Error("Subtopic not found in the study plan");
        }

        if (status) subTopic.status = status;
        if (level) subTopic.level = level;
        if (weakTags && Array.isArray(weakTags)) {
            // merge new unique tags
            const existingTags = new Set(subTopic.weakTags || []);
            weakTags.forEach(t => existingTags.add(t));
            subTopic.weakTags = Array.from(existingTags);
        }
        if (videoLectures) subTopic.videoLectures = videoLectures;
        if (documentation) subTopic.documentation = documentation;
        if (questions) subTopic.questions = questions;

        await plan.save();

        res.status(200).json({
            message: "Subtopic saved",
            data: subTopic
        });
    } catch (err) {
        console.error("Save Study Subtopic Error:", err.message);
        res.status(500).json({
            message: "Failed to save subtopic",
            error: err.message
        });
    }
};

//  Pre Evaluation
export const preEval = async (req, res) => {
    try {
        const { topic } = req.body;

        const response = await client.responses.create({
            model: "openai/gpt-oss-120b",
            input: `
You are an expert teacher.

Generate a pre-evaluation test for the topic: "${topic}"

### Requirements:
- Generate EXACTLY 10 multiple-choice questions
- Each question must have:
  - id (unique, like "q1", "q2")
  - text (clear question)
  - subtopic (the specific sub-concept this question tests, e.g. "React Hooks", "Loops", etc)
  - options (array of exactly 4 strings)
  - correctAnswer (index 0–3 of the correct option)

### Rules:
- Questions should test basic to intermediate understanding
- Avoid duplicate or similar questions
- Keep language simple and clear
- Ensure only ONE correct answer per question

### Output Format (STRICT):
- Return ONLY valid JSON
- Do NOT include explanation or extra text
- Do NOT wrap in markdown or code blocks

[
  {
    "id": "q1",
    "text": "string",
    "subtopic": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0
  }
]
`
        });

        // Safe parsing
        let text = response.output_text?.trim();

        if (!text) {
            throw new Error("Empty response from AI");
        }

        //  Remove accidental markdown
        text = text.replace(/```json|```/g, "").trim();

        const data = JSON.parse(text);

        //  Optional validation (recommended)
        if (!Array.isArray(data) || data.length !== 10) {
            throw new Error("Invalid pre-evaluation format");
        }

        res.json(data);

    } catch (err) {
        console.error("PreEval Error:", err.message);

        res.status(500).json({
            message: "Failed to generate pre-evaluation questions",
            error: err.message
        });
    }
};



//  Topic Content
export const topicContent = async (req, res) => {
    try {
        const { topic, subTopic } = req.body;

        const response = await client.responses.create({
            model: "openai/gpt-oss-120b",
            input: `
You are an expert teacher.

Create learning content for the subtopic: "${subTopic}" under the main topic: "${topic}"

### Requirements:
- Provide a clear and easy-to-understand explanation
- Keep explanation beginner-friendly
- Include 2–3 practical examples
- Provide a useful YouTube search query for learning this topic

### Rules:
- Explanation should be structured and simple
- Avoid very long paragraphs
- Examples should be real-world or practical
- Keep everything concise and useful

### Output Format (STRICT):
- Return ONLY valid JSON
- Do NOT include extra text or explanation
- Do NOT wrap response in markdown/code blocks

{
  "text": "string",
  "examples": ["example1", "example2"],
  "videoSearchQuery": "string"
}
`
        });

        //  Safe parsing
        let text = response.output_text?.trim();

        if (!text) {
            throw new Error("Empty response from AI");
        }

        // 🔥 Remove accidental markdown
        text = text.replace(/```json|```/g, "").trim();

        const data = JSON.parse(text);

        res.json(data);

    } catch (err) {
        console.error("Topic Content Error:", err.message);

        res.status(500).json({
            message: "Failed to generate topic content",
            error: err.message
        });
    }
};



//  Quiz
export const topicQuiz = async (req, res) => {
    try {
        const { topic, subTopic, difficulty } = req.body;

        const response = await client.responses.create({
            model: "openai/gpt-oss-120b",
            input: `
You are an expert teacher.

Generate a quiz for the subtopic "${subTopic}" under the topic "${topic}".

Difficulty level: ${difficulty}

### Requirements:
- Generate EXACTLY 10 multiple-choice questions
- Each question must include:
  - id (unique like "q1", "q2")
  - text
  - options (4 items)
  - correctAnswer (index 0-3)
  - explanation (short)
  - topic (same as input)
  - subCategory (same as input)
  - subSubCategory ()
  - tag (ARRAY of 1–2 specific concepts inside subcategory)

### Rules:
- Only ONE correct answer
- No duplicate questions
- Keep difficulty consistent

### Output Format (STRICT):
- Return ONLY valid JSON
- Do NOT include extra text
- Do NOT wrap in markdown

[
  {
    "id": "q1",
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "string",
    "topic": "${topic}",
    "subCategory": "${subTopic}",
    "tag": ["for-loop"]
  }
]
`
        });

        // Safe parsing
        let text = response.output_text?.trim();
        console.log(text)

        if (!text) {
            throw new Error("Empty response from AI");
        }

        //  Remove markdown if present
        text = text.replace(/```json|```/g, "").trim();

        const data = JSON.parse(text);

        //  Validation
        if (!Array.isArray(data) || data.length !== 10) {
            throw new Error("Invalid quiz format");
        }
        console.log(data)
        res.json(data);

    } catch (err) {
        console.error("Topic Quiz Error:", err.message);

        res.status(500).json({
            message: "Failed to generate quiz",
            error: err.message
        });
    }
};



//  Final Quiz
export const finalQuiz = async (req, res) => {
    try {
        const { topic, subTopics } = req.body;

        const response = await client.responses.create({
            model: "openai/gpt-oss-120b",
            input: `
You are an expert educator.

Generate a comprehensive final quiz for the topic: "${topic}"

The quiz must cover these subtopics:
${subTopics?.join(", ")}

### Requirements:
- Generate EXACTLY 25 multiple-choice questions
- Mix difficulty levels (easy, medium, hard)
- Include some case-based or scenario-based questions
- Each question must include:
  - id (unique like "q1", "q2")
  - text (clear question)
  - options (array of 4 choices)
  - correctAnswer (index 0–3)
  - explanation (brief explanation)

### Rules:
- Ensure only ONE correct answer
- Avoid duplicate or similar questions
- Cover all subtopics evenly
- Keep explanations short and useful

### Output Format (STRICT):
- Return ONLY valid JSON
- Do NOT include extra text or explanation
- Do NOT wrap JSON in markdown/code blocks

[
  {
    "id": "q1",
    "text": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "string"
  }
]
`
        });

        // Safe parsing
        let text = response.output_text?.trim();

        if (!text) {
            throw new Error("Empty response from AI");
        }

        //  Remove markdown if present
        text = text.replace(/```json|```/g, "").trim();

        const data = JSON.parse(text);

        //  Validation
        if (!Array.isArray(data) || data.length !== 25) {
            throw new Error("Invalid final quiz format");
        }

        res.json(data);

    } catch (err) {
        console.error("Final Quiz Error:", err.message);

        res.status(500).json({
            message: "Failed to generate final quiz",
            error: err.message
        });
    }
};



//  Final Report
export const finalReport = async (req, res) => {
    try {
        const { topic, subTopics, score } = req.body;

        const response = await client.responses.create({
            model: "openai/gpt-oss-120b",
            input: `
You are an expert educator.

Generate a final learning report for the topic: "${topic}"

The user studied the following subtopics:
${subTopics?.join(", ")}

The user's performance score is: ${score}%

### Requirements:
- Provide a professional summary of learning
- Identify key strengths
- Identify weaknesses or areas for improvement
- Give clear recommendations
- Suggest next steps for further learning

### Rules:
- Keep language clear and beginner-friendly
- Make insights practical and actionable
- Avoid repetition
- Keep points concise

### Output Format (STRICT):
- Return ONLY valid JSON
- Do NOT include extra text or explanation
- Do NOT wrap JSON in markdown/code blocks

{
  "summary": "string",
  "strengths": ["point1", "point2"],
  "weaknesses": ["point1", "point2"],
  "recommendations": ["point1", "point2"],
  "nextSteps": ["point1", "point2"]
}
`
        });

        //  Safe parsing
        let text = response.output_text?.trim();

        if (!text) {
            throw new Error("Empty response from AI");
        }

        //  Remove markdown if present
        text = text.replace(/```json|```/g, "").trim();

        const data = JSON.parse(text);

        //  Validation
        if (!data.summary || !data.strengths || !data.weaknesses) {
            throw new Error("Invalid report format");
        }

        res.json(data);

    } catch (err) {
        console.error("Final Report Error:", err.message);

        res.status(500).json({
            message: "Failed to generate final report",
            error: err.message
        });
    }
};


export const evaluateAndRegenerate = async (req, res) => {
  try {
    const { topic, originalPlan, answers } = req.body;
    if (!topic || !originalPlan || !answers) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const wrongSubtopicsSet = new Set();
    let correctCount = 0;

    answers.forEach((ans) => {
      if (ans.isCorrect) {
        correctCount++;
      } else {
        wrongSubtopicsSet.add(ans.question.subtopic || ans.question.topic || 'General Concepts');
      }
    });

    const wrongSubtopics = Array.from(wrongSubtopicsSet);
    
    // Ensure we use a clean percentage
    const percentage = (correctCount / answers.length) * 100;
    const level = percentage >= 80 ? "Advanced" : percentage >= 50 ? "Intermediate" : "Beginner";
    
    const prompt = `You are an expert educator and curriculum designer. The user wants to learn "${topic}". 
They took a pre-evaluation test and scored ${correctCount}/${answers.length} (${percentage}%). Their current level is ${level}.
They struggled with these subtopics: ${wrongSubtopics.join(", ")}.

Regenerate a Study Plan of exactly 10 subtopics tailored to a ${level} level.
Make absolutely sure you INCLUDE explicitly the subtopics they got wrong to reinforce their weak areas.

### Output Format (STRICT):
- Return ONLY valid JSON
- Do NOT include any extra text, explanation, or markdown
- Do NOT wrap JSON in code blocks

{
  "subTopics": [
    {
      "id": "t1",
      "title": "string",
      "description": "string",
      "order": 1
    }
  ]
}`;

    const response = await client.responses.create({
        model: "openai/gpt-oss-120b",
        input: prompt
    });

    let aiRes = response.output_text?.trim();
    if (!aiRes) {
        throw new Error("Empty response from AI");
    }
    
    // Remove accidental markdown
    aiRes = aiRes.replace(/```json|```/g, "").trim();

    const data = JSON.parse(aiRes);

    const formattedSubTopics = data.subTopics.map((sub, index) => ({
      subtopicId: sub.id || `t${index + 1}`,
      title: sub.title,
      description: sub.description || "",
      order: index + 1,
      videoLectures: [],
      documentation: [],
      questions: []
    }));

    return res.status(200).json({
      score: correctCount,
      total: answers.length,
      level,
      weakTopics: wrongSubtopics,
      newPlan: formattedSubTopics
    });
  } catch (err) {
    console.error("EVAL_ERROR:", err.message);
    res.status(500).json({ error: "Failed to evaluate and regenerate" });
  }
};
