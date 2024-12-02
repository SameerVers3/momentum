import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  score: { type: Number, required: true },
}, { _id: false });

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  grades: {
    midterms: [questionSchema],
    assignments: [questionSchema],
    quizzes: [questionSchema],
    project: [questionSchema],
    final: [questionSchema],
  },
  isLocked: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Grade', gradeSchema);
