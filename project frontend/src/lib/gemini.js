// import { GoogleGenAI, Type } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: "AIzaSyCpXSiv1Srly2Z2gKCeBnIz0PHa9QPka0g" });

// export async function generateStudyPlan(goal) {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: `Generate a detailed study plan for the learning goal: "${goal}". 
//     Extract the main topic, a list of 7-10 logical subtopics (each with a title and a short description), and 2-3 prerequisites.
//     Format the output as JSON.`,
//     config: {
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.OBJECT,
//         properties: {
//           topic: { type: Type.STRING },
//           subTopics: {
//             type: Type.ARRAY,
//             items: {
//               type: Type.OBJECT,
//               properties: {
//                 id: { type: Type.STRING },
//                 title: { type: Type.STRING },
//                 description: { type: Type.STRING }
//               },
//               required: ["id", "title", "description"]
//             }
//           },
//           prerequisites: {
//             type: Type.ARRAY,
//             items: { type: Type.STRING }
//           }
//         },
//         required: ["topic", "subTopics", "prerequisites"]
//       }
//     }
//   });

//   try {
//     return JSON.parse(response.text || "{}");
//   } catch (error) {
//     console.error("Failed to parse Gemini response:", error);
//     throw new Error("Failed to generate study plan");
//   }
// }

// export async function generatePreEvalQuestions(topic) {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: `Generate 10 pre-evaluation multiple-choice questions to assess a student's current knowledge of "${topic}". 
//     Each question should have 4 options and one correct answer (index 0-3).
//     Format the output as JSON.`,
//     config: {
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.ARRAY,
//         items: {
//           type: Type.OBJECT,
//           properties: {
//             id: { type: Type.STRING },
//             text: { type: Type.STRING },
//             options: {
//               type: Type.ARRAY,
//               items: { type: Type.STRING }
//             },
//             correctAnswer: { type: Type.INTEGER }
//           },
//           required: ["id", "text", "options", "correctAnswer"]
//         }
//       }
//     }
//   });

//   try {
//     return JSON.parse(response.text || "[]");
//   } catch (error) {
//     console.error("Failed to parse Gemini response:", error);
//     throw new Error("Failed to generate evaluation questions");
//   }
// }

// export async function generateTopicQuiz(topic, subTopic, difficulty) {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: `Generate a 5-question multiple-choice quiz for the subtopic "${subTopic}" within the main topic "${topic}". 
//     The difficulty level is "${difficulty}". 
//     Each question should have 4 options, one correct answer (index 0-3), and a brief explanation.
//     Format the output as JSON.`,
//     config: {
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.ARRAY,
//         items: {
//           type: Type.OBJECT,
//           properties: {
//             id: { type: Type.STRING },
//             text: { type: Type.STRING },
//             options: {
//               type: Type.ARRAY,
//               items: { type: Type.STRING }
//             },
//             correctAnswer: { type: Type.INTEGER },
//             explanation: { type: Type.STRING }
//           },
//           required: ["id", "text", "options", "correctAnswer", "explanation"]
//         }
//       }
//     }
//   });

//   try {
//     return JSON.parse(response.text || "[]");
//   } catch (error) {
//     console.error("Failed to parse Gemini response:", error);
//     throw new Error("Failed to generate quiz questions");
//   }
// }

// export async function generateTopicContent(topic, subTopic) {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: `Generate educational content for the subtopic "${subTopic}" within the main topic "${topic}". 
//     Provide a clear text explanation, 2-3 practical examples, and a specific search query for finding a relevant YouTube video.
//     Format the output as JSON.`,
//     config: {
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.OBJECT,
//         properties: {
//           text: { type: Type.STRING },
//           examples: { type: Type.ARRAY, items: { type: Type.STRING } },
//           videoSearchQuery: { type: Type.STRING }
//         },
//         required: ["text", "examples", "videoSearchQuery"]
//       }
//     }
//   });

//   try {
//     return JSON.parse(response.text || "{}");
//   } catch (error) {
//     console.error("Failed to parse Gemini response:", error);
//     throw new Error("Failed to generate topic content");
//   }
// }

// export async function generateFinalQuiz(topic, subTopics) {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: `Generate a comprehensive final quiz for the topic "${topic}" covering these subtopics: ${subTopics.join(", ")}. 
//     Include 25 multiple-choice questions with mixed difficulty and case-based scenarios.
//     Each question should have 4 options, one correct answer (index 0-3), and a brief explanation.
//     Format the output as JSON.`,
//     config: {
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.ARRAY,
//         items: {
//           type: Type.OBJECT,
//           properties: {
//             id: { type: Type.STRING },
//             text: { type: Type.STRING },
//             options: {
//               type: Type.ARRAY,
//               items: { type: Type.STRING }
//             },
//             correctAnswer: { type: Type.INTEGER },
//             explanation: { type: Type.STRING }
//           },
//           required: ["id", "text", "options", "correctAnswer", "explanation"]
//         }
//       }
//     }
//   });

//   try {
//     return JSON.parse(response.text || "[]");
//   } catch (error) {
//     console.error("Failed to parse Gemini response:", error);
//     throw new Error("Failed to generate final quiz");
//   }
// }

// export async function generateFinalReport(topic, subTopics, score) {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: `Generate a final learning report for the topic "${topic}". 
//     The user covered these subtopics: ${subTopics.join(", ")}. 
//     The overall performance score was ${score}%.
//     Provide a professional summary, key strengths, areas for improvement (weaknesses), specific recommendations, and suggested next steps.
//     Format the output as JSON.`,
//     config: {
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.OBJECT,
//         properties: {
//           summary: { type: Type.STRING },
//           strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
//           weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
//           recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
//           nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
//         },
//         required: ["summary", "strengths", "weaknesses", "recommendations", "nextSteps"]
//       }
//     }
//   });

//   try {
//     return JSON.parse(response.text || "{}");
//   } catch (error) {
//     console.error("Failed to parse Gemini response:", error);
//     throw new Error("Failed to generate final report");
//   }
// }


import api from "../api/axiosInstance";

// Study Plan
export const generateStudyPlan = (goal, courseId = null, difficulty = null, persist = true) =>
  api.post("/gemini/study-plan", { goal, courseId, difficulty, persist });

// Pre Eval
export const generatePreEvalQuestions = (topic) =>
  api.post("/gemini/pre-eval", { topic });

// Topic Content
export const generateTopicContent = (topic, subTopic) =>
  api.post("/gemini/topic-content", { topic, subTopic });

// Quiz
export const generateTopicQuiz = (topic, subTopic, diffculty ) =>
  api.post("/gemini/topic-quiz", { topic, subTopic, diffculty });

// Final Quiz
export const generateFinalQuiz = (topic) =>
  api.post("/gemini/final-quiz", { topic });

// Report
export const generateFinalReport = (topic, score) =>
  api.post("/gemini/final-report", { topic, score });