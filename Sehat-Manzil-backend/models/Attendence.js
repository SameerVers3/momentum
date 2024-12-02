import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
