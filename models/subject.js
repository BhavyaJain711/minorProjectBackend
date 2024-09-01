import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
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
    courses:{
        type: Array,
        required: true
    },
    semesters:{
        type: Array,
        required: true
    },
    credit: {
        type: Number,
        required: true
    }
});