import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to your .env file or Render environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const testResultSchema = new mongoose.Schema({
  learnerId: { type: String, required: true, index: true },
  learnerName: { type: String, default: null },
  moduleName: { type: String, required: true, index: true }, // Listening / Speaking / Reading / Writing
  testType: { type: String, required: true, index: true },   // Pre-test / Post-test / Practice
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  sessionDuration: { type: Number, default: null },          // minutes
  calmModeActivatedCount: { type: Number, default: 0 },
  calmModeResumedCount: { type: Number, default: 0 },
  inattentiveCount: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: true },
  sessionKey: { type: String, unique: true, sparse: true }, // sparse = allows many nulls
  timestamp: { type: Date, default: Date.now },
});

const TestResult = mongoose.model('TestResult', testResultSchema);

export default TestResult;