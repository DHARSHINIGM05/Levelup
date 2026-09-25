import express from 'express';
import cors from 'cors';
import TestResult from './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://levelup-learning-chi.vercel.app',
  ],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

// ✅ INSERT DUMMY DATA FOR TESTING (runs only if collection empty)
async function insertDummyDataIfEmpty() {
  const count = await TestResult.countDocuments();
  if (count > 0) return;

  console.log('Inserting dummy test data...');

  const learnerId = 'TestChild_class_5';

  const dummyData = [
    ['Listening', 'Pre-test', 10, 6, 60, 12, 2, 2, 5],
    ['Listening', 'Post-test', 10, 8, 80, 10, 1, 1, 2],

    ['Speaking', 'Pre-test', 10, 6, 62, 13, 2, 2, 4],
    ['Speaking', 'Post-test', 10, 9, 88, 11, 1, 1, 1],

    ['Reading', 'Pre-test', 10, 6, 60, 14, 3, 2, 3],
    ['Reading', 'Post-test', 10, 8, 84, 12, 1, 1, 2],

    ['Writing', 'Pre-test', 10, 5, 55, 15, 3, 2, 4],
    ['Writing', 'Post-test', 10, 8, 80, 13, 2, 1, 2],
  ];

  const docs = dummyData.map((row) => ({
    learnerId,
    learnerName: 'TestChild',
    moduleName: row[0],
    testType: row[1],
    totalQuestions: row[2],
    correctAnswers: row[3],
    accuracy: row[4],
    sessionDuration: row[5],
    calmModeActivatedCount: row[6],
    calmModeResumedCount: row[7],
    inattentiveCount: row[8],
    isCompleted: true,
  }));

  await TestResult.insertMany(docs);
  console.log('Dummy data inserted successfully.');
}

insertDummyDataIfEmpty().catch((err) => console.error('Dummy data insert failed:', err));

// 1️⃣ Save new test result
app.post('/api/test-result', async (req, res) => {
  try {
    const {
      learnerId,
      learnerName,
      moduleName,
      testType,
      totalQuestions,
      correctAnswers,
      sessionDuration,
      calmModeActivatedCount = 0,
      calmModeResumedCount = 0,
      inattentiveCount = 0,
      isCompleted = true,
      sessionKey = null,
    } = req.body || {};

    if (!learnerId || !moduleName || !testType) {
      return res.status(400).json({ error: 'learnerId, moduleName, and testType are required.' });
    }
    if (!Number.isFinite(totalQuestions) || totalQuestions <= 0) {
      return res.status(400).json({ error: 'totalQuestions must be a positive number.' });
    }
    if (!Number.isFinite(correctAnswers) || correctAnswers < 0 || correctAnswers > totalQuestions) {
      return res.status(400).json({ error: 'correctAnswers must be between 0 and totalQuestions.' });
    }

    if (sessionKey) {
      const existing = await TestResult.findOne({ sessionKey });
      if (existing) {
        return res.status(409).json({ error: 'Duplicate test result for this sessionKey.' });
      }
    }

    const accuracy = round2((correctAnswers / totalQuestions) * 100);
    const durationMinutes = sessionDuration != null ? round2(sessionDuration) : null;

    const doc = {
      learnerId: String(learnerId),
      learnerName: learnerName || null,
      moduleName: String(moduleName),
      testType: String(testType),
      totalQuestions: Number(totalQuestions),
      correctAnswers: Number(correctAnswers),
      accuracy,
      sessionDuration: durationMinutes,
      calmModeActivatedCount: Number(calmModeActivatedCount) || 0,
      calmModeResumedCount: Number(calmModeResumedCount) || 0,
      inattentiveCount: Number(inattentiveCount) || 0,
      isCompleted: !!isCompleted,
    };
    if (sessionKey) {
      doc.sessionKey = sessionKey;
    }

    const created = await TestResult.create(doc);

    return res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/test-result error', err);
    return res.status(500).json({ error: 'Failed to save test result.' });
  }
});

// 2️⃣ Get all test records of a learner
app.get('/api/test-result/:learnerId', async (req, res) => {
  try {
    const { learnerId } = req.params;
    const rows = await TestResult.find({ learnerId }).sort({ timestamp: 1, _id: 1 });
    return res.json(rows);
  } catch (err) {
    console.error('GET /api/test-result/:learnerId error', err);
    return res.status(500).json({ error: 'Failed to fetch test results.' });
  }
});

// Helper: compute per-module averages
function computeModuleStats(rows) {
  const byModule = {};
  for (const r of rows) {
    const key = r.moduleName;
    if (!byModule[key]) {
      byModule[key] = {
        preAccSum: 0,
        preCount: 0,
        postAccSum: 0,
        postCount: 0,
      };
    }
    const m = byModule[key];
    if (r.testType === 'Pre-test') {
      m.preAccSum += r.accuracy;
      m.preCount += 1;
    } else if (r.testType === 'Post-test') {
      m.postAccSum += r.accuracy;
      m.postCount += 1;
    }
  }

  const result = {};
  for (const [moduleName, m] of Object.entries(byModule)) {
    const preAvg = m.preCount ? m.preAccSum / m.preCount : null;
    const postAvg = m.postCount ? m.postAccSum / m.postCount : null;
    let improvementPct = null;
    let learningGain = null;
    if (preAvg != null && preAvg > 0 && postAvg != null) {
      improvementPct = ((postAvg - preAvg) / preAvg) * 100;
      if (preAvg < 100) {
        learningGain = (postAvg - preAvg) / (100 - preAvg);
      }
    }
    result[moduleName] = {
      averagePreAccuracy: preAvg != null ? round2(preAvg) : null,
      averagePostAccuracy: postAvg != null ? round2(postAvg) : null,
      improvementPercent: improvementPct != null ? round2(improvementPct) : null,
      learningGainIndex: learningGain != null ? round2(learningGain) : null,
    };
  }
  return result;
}

// 3️⃣ Analytics for a learner
app.get('/api/analytics/:learnerId', async (req, res) => {
  try {
    const { learnerId } = req.params;
    const rows = await TestResult.find({ learnerId });

    if (!rows.length) {
      return res.json({
        learnerId,
        modules: {},
        averageSessionDuration: 0,
        totalCalmModeActivations: 0,
        totalInattentiveDetections: 0,
        engagementRate: 0,
        attentionDetectionRate: 0,
        calmModeRecoveryRate: 0,
        overallAccuracy: 0,
        overallErrorRate: 0,
      });
    }

    const modules = computeModuleStats(rows);

    const totalSessions = rows.length;
    const completedSessions = rows.filter((r) => r.isCompleted).length;
    const sumDuration = rows.reduce(
      (acc, r) => acc + (Number.isFinite(r.sessionDuration) ? r.sessionDuration : 0),
      0,
    );
    const totalCalmModeActivations = rows.reduce(
      (acc, r) => acc + (r.calmModeActivatedCount || 0),
      0,
    );
    const totalCalmModeResumed = rows.reduce(
      (acc, r) => acc + (r.calmModeResumedCount || 0),
      0,
    );
    const totalInattentiveDetections = rows.reduce(
      (acc, r) => acc + (r.inattentiveCount || 0),
      0,
    );
    const avgSessionDuration = totalSessions ? sumDuration / totalSessions : 0;

    const engagementRate = totalSessions
      ? round2((completedSessions / totalSessions) * 100)
      : 0;

    const sessionsWithInattentive = rows.filter((r) => (r.inattentiveCount || 0) > 0).length;
    const attentionDetectionRate = totalSessions
      ? round2((sessionsWithInattentive / totalSessions) * 100)
      : 0;

    const calmModeRecoveryRate = totalCalmModeActivations > 0
      ? round2((totalCalmModeResumed / totalCalmModeActivations) * 100)
      : 0;

    const overallAccuracy = rows.reduce((acc, r) => acc + (r.accuracy || 0), 0) / totalSessions;
    const overallErrorRate = 100 - overallAccuracy;

    return res.json({
      learnerId,
      modules,
      averageSessionDuration: round2(avgSessionDuration),
      totalCalmModeActivations: Number(totalCalmModeActivations),
      totalInattentiveDetections: Number(totalInattentiveDetections),
      engagementRate,
      attentionDetectionRate,
      calmModeRecoveryRate,
      overallAccuracy: round2(overallAccuracy),
      overallErrorRate: round2(overallErrorRate),
    });
  } catch (err) {
    console.error('GET /api/analytics/:learnerId error', err);
    return res.status(500).json({ error: 'Failed to compute analytics.' });
  }
});

// 4️⃣ Admin study metrics
app.get('/api/admin/study-metrics', async (req, res) => {
  try {
    const all = await TestResult.find({});
    if (!all.length) {
      return res.json({
        totalParticipants: 0,
        studyDurationInDays: 0,
        totalTestsConducted: 0,
        totalQuestionsAttempted: 0,
        averageAccuracy: 0,
        overallImprovementPercent: 0,
      });
    }

    const totalTestsConducted = all.length;
    const totalQuestionsAttempted = all.reduce(
      (acc, r) => acc + (r.totalQuestions || 0),
      0,
    );

    const totalParticipants = new Set(all.map((r) => r.learnerId)).size;

    const timestamps = all.map((r) => new Date(r.timestamp).getTime());
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);

    let studyDurationInDays = 0;
    if (minTs && maxTs) {
      studyDurationInDays = (maxTs - minTs) / (1000 * 60 * 60 * 24);
    }

    const averageAccuracy = all.reduce((acc, r) => acc + (r.accuracy || 0), 0) / totalTestsConducted;

    const preRows = all.filter((r) => r.testType === 'Pre-test');
    const postRows = all.filter((r) => r.testType === 'Post-test');
    const preAvg = preRows.length
      ? preRows.reduce((acc, r) => acc + (r.accuracy || 0), 0) / preRows.length
      : null;
    const postAvg = postRows.length
      ? postRows.reduce((acc, r) => acc + (r.accuracy || 0), 0) / postRows.length
      : null;

    let overallImprovementPercent = 0;
    if (preAvg != null && preAvg > 0 && postAvg != null) {
      overallImprovementPercent = ((postAvg - preAvg) / preAvg) * 100;
    }

    return res.json({
      totalParticipants: Number(totalParticipants || 0),
      studyDurationInDays: round2(studyDurationInDays),
      totalTestsConducted,
      totalQuestionsAttempted,
      averageAccuracy: round2(averageAccuracy),
      overallImprovementPercent: round2(overallImprovementPercent),
    });
  } catch (err) {
    console.error('GET /api/admin/study-metrics error', err);
    return res.status(500).json({ error: 'Failed to compute study metrics.' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Level Up Learning analytics backend running.' });
});

app.get('/api/debug/all', async (req, res) => {
  try {
    const rows = await TestResult.find({});
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Analytics API server listening on http://localhost:${PORT}`);
});