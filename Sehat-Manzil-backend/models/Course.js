import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true, unique: true },
  creditHours: { type: Number, required: true },
  feesPerCreditHour: { type: Number, default: 20000 },
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDroppable: { type: Boolean, default: true },
  registrationOpen: { type: Boolean, default: false }, // To track if registration is open
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
