import mongoose from 'mongoose';

const examComponentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    subject: {
        type: Array,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    components: {
        type: Array,
        required: true
    }
});