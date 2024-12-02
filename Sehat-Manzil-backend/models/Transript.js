import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the student
  courses: [
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // Reference to the course
      grade: { type: String, required: true }, // Grade received (e.g., A, B, C)
      creditHours: { type: Number, required: true }, // Credit hours for the course
      semester: { type: String, required: true }, // Semester in which the course was taken
      year: { type: Number, required: true }, // Year in which the course was taken
    }
  ],
  gpa: { type: Number, default: 0 }, // GPA calculated from the grades
}, { timestamps: true });

export default mongoose.model('Transcript', transcriptSchema);
