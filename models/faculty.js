import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    abbr:{
        type: String,
        required:true
    },
    department: {
        type: String,
        required: true
    },
    courses:{
        type: Array,
        required: true
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
    }
});