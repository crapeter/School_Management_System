const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    StudentId: {
        type: String,
        required: true
    },
    Schedule: [{
        type: String
    }],
    Grades: [{
        type: Number
    }]
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;