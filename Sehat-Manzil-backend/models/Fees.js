import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  totalCreditHours: { type: Number, required: true },
  totalFees: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  paymentDate: { type: Date },
}, { timestamps: true });

export default mongoose.model('Fee', feeSchema);
