import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code:{
        type: String,
        required:true
    },
    department: {
        type: Array,
        required: true
    },
    totalCredits: {
        type: Number,
        required: true
    },
    totalSemesters: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});