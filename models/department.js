import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code:{
        type: String,
        required:true
    },
    school: {
        type: String,
        required: true
    }
});