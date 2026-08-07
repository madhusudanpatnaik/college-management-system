const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getStudentProfileByUserId } = require("../config/db");
const { TOPIC_TIPS } = require("../config/placementData");

const router = express.Router();
router.use(authMiddleware);

const OPTIONS = ["A", "B", "C", "D"];
const DIFFICULTIES = ["easy", "medium", "hard"];
const WEAK_THRESHOLD = 60; // accuracy % at or below which a topic counts as "weak"
const STRONG_THRESHOLD = 80; // accuracy % at or above which a topic counts as a strength

function httpError(message, status) {
  return Object.assign(new Error(message), { status });
}

function requireStudent(req) {
  const profile = getStudentProfileByUserId(req.user.id);
  if (!profile) {
    throw httpError("Student profile not found.", 404);
  }
  return profile;
}

function optionTextMap(row) {
  return { A: row.option_a, B: row.option_b, C: row.option_c, D: row.option_d };
}

function accuracyPct(correct, answered) {
  return answered > 0 ? Math.round((correct / answered) * 100) : 0;
}

// Turn raw [{ topic, answered, correct }] rows into actionable feedback.
function buildFeedback(topicStats) {
  const weakAreas = [];
  const strengths = [];

  topicStats.forEach((stat) => {
    const accuracy = accuracyPct(stat.correct, stat.answered);
    const entry = {
      topic: stat.topic,
      answered: stat.answered,
      correct: stat.correct,
      accuracy,
      tip: TOPIC_TIPS[stat.topic] || "Keep practising this topic with a mix of difficulty levels."
    };

    if (stat.answered > 0 && accuracy < WEAK_THRESHOLD) {
      weakAreas.push(entry);
    } else if (stat.answered > 0 && accuracy >= STRONG_THRESHOLD) {
      strengths.push(entry);
    }
  });

  weakAreas.sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered);
  strengths.sort((a, b) => b.accuracy - a.accuracy || b.answered - a.answered);

  const recommendations = weakAreas
    .slice(0, 5)
    .map((area) => `${area.topic} (${area.accuracy}% so far): ${area.tip}`);

  const totalAnswered = topicStats.reduce((sum, stat) => sum + stat.answered, 0);
  const totalCorrect = topicStats.reduce((sum, stat) => sum + stat.correct, 0);
  const overall = accuracyPct(totalCorrect, totalAnswered);

  let label;
  if (totalAnswered === 0) {
    label = "Not started";
  } else if (overall >= STRONG_THRESHOLD) {
    label = "Placement ready";
  } else if (overall >= 65) {
    label = "On track";
  } else if (overall >= 50) {
    label = "Needs practice";
  } else {
    label = "Focus required";
  }

  return {
    weakAreas,
    strengths,
    recommendations,
    readiness: { score: overall, label }
  };
}

function getStudentTopicStats(studentId) {
  return db
    .prepare(
      `
        SELECT q.topic AS topic,
               COUNT(*) AS answered,
               SUM(a.is_correct) AS correct
        FROM placement_attempts a
        JOIN placement_questions q ON q.id = a.question_id
        WHERE a.student_id = ?
        GROUP BY q.topic
      `
    )
    .all(studentId)
    .map((row) => ({ topic: row.topic, answered: row.answered, correct: row.correct || 0 }));
}

// ---------------------------------------------------------------------------
// Student endpoints
// ---------------------------------------------------------------------------

// Catalogue, personal stats, topic breakdown, and tailored feedback.
router.get("/overview", roleMiddleware("student"), (req, res) => {
  const student = requireStudent(req);

  const categories = db
    .prepare(
      `
        SELECT category, COUNT(*) AS questionCount
        FROM placement_questions
        GROUP BY category
        ORDER BY category
      `
    )
    .all();

  const summaryRow = db
    .prepare(
      `
        SELECT COUNT(*) AS answered,
               SUM(is_correct) AS correct,
               COUNT(DISTINCT question_id) AS distinctQuestions
        FROM placement_attempts
        WHERE student_id = ?
      `
    )
    .get(student.id);

  const answered = summaryRow.answered || 0;
  const correct = summaryRow.correct || 0;

  const categoryBreakdown = db
    .prepare(
      `
        SELECT q.category AS category,
               COUNT(*) AS answered,
               SUM(a.is_correct) AS correct
        FROM placement_attempts a
        JOIN placement_questions q ON q.id = a.question_id
        WHERE a.student_id = ?
        GROUP BY q.category
        ORDER BY q.category
      `
    )
    .all(student.id)
    .map((row) => ({
      category: row.category,
      answered: row.answered,
      correct: row.correct || 0,
      accuracy: accuracyPct(row.correct || 0, row.answered)
    }));

  const topicStats = getStudentTopicStats(student.id);
  const topicBreakdown = topicStats
    .map((stat) => ({
      topic: stat.topic,
      answered: stat.answered,
      correct: stat.correct,
      accuracy: accuracyPct(stat.correct, stat.answered)
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const recentActivity = db
    .prepare(
      `
        SELECT q.topic AS topic,
               q.category AS category,
               a.is_correct AS isCorrect,
               a.created_at AS attemptedAt
        FROM placement_attempts a
        JOIN placement_questions q ON q.id = a.question_id
        WHERE a.student_id = ?
        ORDER BY a.id DESC
        LIMIT 10
      `
    )
    .all(student.id)
    .map((row) => ({
      topic: row.topic,
      category: row.category,
      isCorrect: row.isCorrect === 1,
      attemptedAt: row.attemptedAt
    }));

  return res.json({
    categories,
    difficulties: DIFFICULTIES,
    summary: {
      answered,
      correct,
      incorrect: answered - correct,
      distinctQuestions: summaryRow.distinctQuestions || 0,
      accuracy: accuracyPct(correct, answered)
    },
    categoryBreakdown,
    topicBreakdown,
    recentActivity,
    feedback: buildFeedback(topicStats)
  });
});

// Deliver a randomized quiz. Correct answers and explanations are deliberately
// NOT included in this payload so they cannot be scraped before submitting.
router.get("/quiz", roleMiddleware("student"), (req, res) => {
  requireStudent(req);

  const filters = [];
  const params = [];

  if (req.query.category) {
    filters.push("category = ?");
    params.push(String(req.query.category));
  }

  if (req.query.difficulty) {
    const difficulty = String(req.query.difficulty);
    if (!DIFFICULTIES.includes(difficulty)) {
      throw httpError("Difficulty must be one of: easy, medium, hard.", 400);
    }
    filters.push("difficulty = ?");
    params.push(difficulty);
  }

  let limit = Number.parseInt(req.query.limit, 10);
  if (!Number.isInteger(limit) || limit <= 0) {
    limit = 5;
  }
  limit = Math.min(limit, 20);

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const questions = db
    .prepare(
      `
        SELECT id, category, topic, difficulty, question, option_a, option_b, option_c, option_d
        FROM placement_questions
        ${whereClause}
        ORDER BY RANDOM()
        LIMIT ?
      `
    )
    .all([...params, limit])
    .map((row) => ({
      id: row.id,
      category: row.category,
      topic: row.topic,
      difficulty: row.difficulty,
      question: row.question,
      options: optionTextMap(row)
    }));

  return res.json({ questions, count: questions.length });
});

// Grade a submitted quiz, record each attempt, and return per-question
// explanations plus topic-level feedback for the questions in this quiz.
router.post("/submit", roleMiddleware("student"), (req, res) => {
  const student = requireStudent(req);
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    throw httpError("Submit at least one answer.", 400);
  }

  if (answers.length > 50) {
    throw httpError("Too many answers in a single submission.", 400);
  }

  // Validate and resolve every answer up front so we record nothing on a bad
  // request (all-or-nothing).
  const resolved = answers.map((answer) => {
    const questionId = Number(answer && answer.questionId);
    const selectedOption = String(answer && answer.selectedOption || "").toUpperCase();

    if (!Number.isInteger(questionId) || questionId <= 0) {
      throw httpError("Each answer needs a valid questionId.", 400);
    }
    if (!OPTIONS.includes(selectedOption)) {
      throw httpError("Each answer's selectedOption must be A, B, C, or D.", 400);
    }

    const question = db
      .prepare(
        `
          SELECT id, category, topic, difficulty, question,
                 option_a, option_b, option_c, option_d, correct_option, explanation
          FROM placement_questions
          WHERE id = ?
        `
      )
      .get(questionId);

    if (!question) {
      throw httpError(`Question ${questionId} does not exist.`, 400);
    }

    return { question, selectedOption };
  });

  const recordAttempts = db.transaction((items) => {
    const insert = db.prepare(
      `
        INSERT INTO placement_attempts (student_id, question_id, selected_option, is_correct)
        VALUES (?, ?, ?, ?)
      `
    );
    items.forEach((item) => {
      const isCorrect = item.selectedOption === item.question.correct_option ? 1 : 0;
      insert.run(student.id, item.question.id, item.selectedOption, isCorrect);
    });
  });
  recordAttempts(resolved);

  const results = resolved.map(({ question, selectedOption }) => {
    const optionMap = optionTextMap(question);
    const isCorrect = selectedOption === question.correct_option;
    return {
      questionId: question.id,
      category: question.category,
      topic: question.topic,
      difficulty: question.difficulty,
      question: question.question,
      options: optionMap,
      yourOption: selectedOption,
      yourAnswer: optionMap[selectedOption],
      correctOption: question.correct_option,
      correctAnswer: optionMap[question.correct_option],
      isCorrect,
      explanation: question.explanation
    };
  });

  const correctCount = results.filter((result) => result.isCorrect).length;

  // Topic feedback scoped to the questions in THIS quiz.
  const perTopic = new Map();
  results.forEach((result) => {
    const stat = perTopic.get(result.topic) || { topic: result.topic, answered: 0, correct: 0 };
    stat.answered += 1;
    stat.correct += result.isCorrect ? 1 : 0;
    perTopic.set(result.topic, stat);
  });

  return res.json({
    results,
    score: {
      total: results.length,
      correct: correctCount,
      incorrect: results.length - correctCount,
      accuracy: accuracyPct(correctCount, results.length)
    },
    feedback: buildFeedback([...perTopic.values()])
  });
});

// ---------------------------------------------------------------------------
// Admin / faculty endpoints (question bank management + cohort analytics)
// ---------------------------------------------------------------------------

router.get("/questions", roleMiddleware("admin", "faculty"), (_req, res) => {
  const questions = db
    .prepare(
      `
        SELECT id, category, topic, difficulty, question,
               option_a, option_b, option_c, option_d, correct_option, explanation, created_at
        FROM placement_questions
        ORDER BY category, topic, id
      `
    )
    .all();

  return res.json({ questions, count: questions.length });
});

router.post("/questions", roleMiddleware("admin", "faculty"), (req, res) => {
  const {
    category,
    topic,
    difficulty,
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOption,
    explanation
  } = req.body;

  const required = { category, topic, difficulty, question, optionA, optionB, optionC, optionD, correctOption, explanation };
  for (const [field, value] of Object.entries(required)) {
    if (!value || !String(value).trim()) {
      throw httpError(`Field "${field}" is required.`, 400);
    }
  }

  const normalizedCorrect = String(correctOption).toUpperCase();
  if (!OPTIONS.includes(normalizedCorrect)) {
    throw httpError("correctOption must be A, B, C, or D.", 400);
  }
  if (!DIFFICULTIES.includes(String(difficulty))) {
    throw httpError("difficulty must be one of: easy, medium, hard.", 400);
  }

  const result = db
    .prepare(
      `
        INSERT INTO placement_questions
          (category, topic, difficulty, question, option_a, option_b, option_c, option_d, correct_option, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      String(category).trim(),
      String(topic).trim(),
      String(difficulty),
      String(question).trim(),
      String(optionA).trim(),
      String(optionB).trim(),
      String(optionC).trim(),
      String(optionD).trim(),
      normalizedCorrect,
      String(explanation).trim()
    );

  return res.status(201).json({ message: "Question added.", id: result.lastInsertRowid });
});

router.delete("/questions/:id", roleMiddleware("admin"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw httpError("Invalid question id.", 400);
  }

  const result = db.prepare("DELETE FROM placement_questions WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw httpError("Question not found.", 404);
  }

  return res.json({ message: "Question deleted." });
});

router.get("/analytics", roleMiddleware("admin", "faculty"), (_req, res) => {
  const totals = db
    .prepare(
      `
        SELECT
          (SELECT COUNT(*) FROM placement_questions) AS totalQuestions,
          (SELECT COUNT(*) FROM placement_attempts) AS totalAttempts,
          (SELECT COUNT(DISTINCT student_id) FROM placement_attempts) AS activeStudents,
          (SELECT COALESCE(SUM(is_correct), 0) FROM placement_attempts) AS totalCorrect
      `
    )
    .get();

  const categoryBreakdown = db
    .prepare(
      `
        SELECT q.category AS category,
               COUNT(*) AS answered,
               SUM(a.is_correct) AS correct
        FROM placement_attempts a
        JOIN placement_questions q ON q.id = a.question_id
        GROUP BY q.category
        ORDER BY q.category
      `
    )
    .all()
    .map((row) => ({
      category: row.category,
      answered: row.answered,
      correct: row.correct || 0,
      accuracy: accuracyPct(row.correct || 0, row.answered)
    }));

  const weakestTopics = db
    .prepare(
      `
        SELECT q.topic AS topic,
               COUNT(*) AS answered,
               SUM(a.is_correct) AS correct
        FROM placement_attempts a
        JOIN placement_questions q ON q.id = a.question_id
        GROUP BY q.topic
        HAVING answered >= 1
        ORDER BY (CAST(SUM(a.is_correct) AS REAL) / COUNT(*)) ASC
        LIMIT 5
      `
    )
    .all()
    .map((row) => ({
      topic: row.topic,
      answered: row.answered,
      accuracy: accuracyPct(row.correct || 0, row.answered)
    }));

  return res.json({
    totalQuestions: totals.totalQuestions,
    totalAttempts: totals.totalAttempts,
    activeStudents: totals.activeStudents,
    overallAccuracy: accuracyPct(totals.totalCorrect, totals.totalAttempts),
    categoryBreakdown,
    weakestTopics
  });
});

module.exports = router;
