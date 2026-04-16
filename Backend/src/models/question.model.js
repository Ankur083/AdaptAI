import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
       
        question: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        options: {
            type: [String],
            required: true,
            validate: {
                validator: (val) => val.length === 4,
                message: "Exactly 4 options required"
            }
        },

        correctAnswer: {
            type: Number,
            required: true,
            min: 0,
            max: 3
        },

        explanation: {
            type: String,
            required: true
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
            required: true,
            index: true
        },


        tags: {
            type: [String],
            required: true,
            index: true
        },


        difficulty: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            required: true,
            default: "Beginner",
            set: (val) =>
                val?.charAt(0).toUpperCase() + val?.slice(1).toLowerCase()
        },
 
  
    },
    {
        timestamps: true
    }
);

export const Question = mongoose.model("Question", questionSchema);