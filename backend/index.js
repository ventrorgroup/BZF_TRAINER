const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Get random question
app.get('/api/questions/random', async (req, res) => {
    const count = await prisma.question.count();
    const skip = Math.floor(Math.random() * count);
    const question = await prisma.question.findFirst({
        skip: skip,
        include: { answers: true, stats: true }
    });
    res.json(question);
});

// Get question by its qNumber (sequential)
app.get('/api/questions/by-number/:num', async (req, res) => {
    const question = await prisma.question.findFirst({
        where: { qNumber: req.params.num },
        include: { answers: true, stats: true }
    });
    res.json(question);
});

// Get unsure questions (incorrect > correct or not answered)
app.get('/api/questions/unsure', async (req, res) => {
    const questions = await prisma.question.findMany({
        where: {
            OR: [
                { stats: { incorrect: { gt: prisma.userStat.fields.correct } } },
                { stats: { is: null } }
            ]
        },
        include: { answers: true, stats: true },
        take: 20
    });
    res.json(questions);
});

// Update question stats (answers)
app.post('/api/answers', async (req, res) => {
    const { questionId, isCorrect } = req.body;
    const stat = await prisma.userStat.upsert({
        where: { questionId },
        update: {
            correct: isCorrect ? { increment: 1 } : undefined,
            incorrect: !isCorrect ? { increment: 1 } : undefined,
        },
        create: {
            questionId,
            correct: isCorrect ? 1 : 0,
            incorrect: !isCorrect ? 1 : 0,
        }
    });
    res.json(stat);
});

// Toggle difficult flag
app.post('/api/questions/:id/toggle-flag', async (req, res) => {
    const questionId = parseInt(req.params.id);
    const { isDifficult } = req.body;
    const stat = await prisma.userStat.upsert({
        where: { questionId },
        update: { isDifficult },
        create: { questionId, isDifficult }
    });
    res.json(stat);
});

// Get difficult questions
app.get('/api/questions/difficult', async (req, res) => {
    const questions = await prisma.question.findMany({
        where: {
            stats: { isDifficult: true }
        },
        include: { answers: true, stats: true }
    });
    res.json(questions);
});

// Exams
app.get('/api/exams', async (req, res) => {
    console.log('GET /api/exams requested');
    const exams = await prisma.exam.findMany({
        include: { _count: { select: { results: true } } }
    });
    console.log(`Returning ${exams.length} exams`);
    res.json(exams);
});

app.get('/api/exams/:id', async (req, res) => {
    console.log(`GET /api/exams/${req.params.id} requested`);
    const exam = await prisma.exam.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
            examQuestions: {
                include: {
                    question: { include: { answers: true } }
                }
            }
        }
    });
    console.log(`Returning exam data for: ${exam?.name}`);
    res.json(exam);
});

app.post('/api/exams/:id/result', async (req, res) => {
    const { score } = req.body;
    console.log(`POST /api/exams/${req.params.id}/result with score ${score}`);
    const result = await prisma.examResult.create({
        data: {
            examId: parseInt(req.params.id),
            score
        }
    });
    res.json(result);
});

// Dashboard Statistics
app.get('/api/stats/dashboard', async (req, res) => {
    const totalQuestions = await prisma.question.count();
    const stats = await prisma.userStat.aggregate({
        _sum: {
            correct: true,
            incorrect: true
        }
    });
    
    const answeredQuestions = await prisma.userStat.count();
    const difficultCount = await prisma.userStat.count({
        where: { isDifficult: true }
    });

    const examResults = await prisma.examResult.findMany({
        take: 5,
        orderBy: { date: 'desc' }
    });

    res.json({
        totalQuestions,
        answeredQuestions,
        difficultCount,
        totalCorrect: stats._sum.correct || 0,
        totalIncorrect: stats._sum.incorrect || 0,
        recentExams: examResults
    });
});

// Reset Stats
app.post('/api/stats/reset', async (req, res) => {
    await prisma.userStat.deleteMany();
    await prisma.examResult.deleteMany();
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

start();
