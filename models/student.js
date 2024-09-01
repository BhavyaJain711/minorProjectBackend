import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roll:{
        type: String,
        required:true
    },
    // email: {
    //     type: String,
    //     required: true
    // },
    secondary_email: {
        type: String
    },
    // password: {
    //     type: String,
    //     required: true
    // },
    phone:{
        type: Array,
        required: true
    },
    department: {
        type: Array,
        required: true
    },
    courses:{
        type: Array,
        required: true
    },
    year:{
        type: Number,
        required: true
    },
    currentSemester:{
        type: Number,
        required: true
    },
    division:{
        type: String,
        required: true
    },
    lab_group:{
        type: String,
        required: true
    }


});