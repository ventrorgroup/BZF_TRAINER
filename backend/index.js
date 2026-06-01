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

const APP_PASSWORD = 'BZF-Trainer-8jK9-mP4q';

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const password = req.headers['x-bzf-password'] || req.headers['authorization'];
    const providedPass = password ? password.replace(/^Bearer\s+/, '') : '';

    if (providedPass === APP_PASSWORD) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Invalid password.' });
};

// Public Login Endpoint
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === APP_PASSWORD) {
        return res.json({ success: true, token: APP_PASSWORD });
    }
    return res.status(401).json({ success: false, error: 'Ungültiges Passwort' });
});

// Protect all /api/ paths except login
app.use((req, res, next) => {
    if (req.path === '/api/auth/login') {
        return next();
    }
    if (req.path.startsWith('/api')) {
        return authMiddleware(req, res, next);
    }
    next();
});

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

// Get unsure questions (incorrect > correct)
app.get('/api/questions/unsure', async (req, res) => {
    const questions = await prisma.question.findMany({
        where: {
            stats: { incorrect: { gt: prisma.userStat.fields.correct } }
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

// --- BZF English Texts ---

// Get random BZF text
app.get('/api/texts/random', async (req, res) => {
    const count = await prisma.bzfText.count();
    if (count === 0) return res.json(null);
    const skip = Math.floor(Math.random() * count);
    const text = await prisma.bzfText.findFirst({
        skip: skip,
        include: { stats: true }
    });

    if (text) {
        await prisma.textStat.upsert({
            where: { textId: text.id },
            update: { viewCount: { increment: 1 } },
            create: { textId: text.id, viewCount: 1 }
        });
    }

    res.json(text);
});

// Get BZF text by its number
app.get('/api/texts/by-number/:num', async (req, res) => {
    const text = await prisma.bzfText.findFirst({
        where: { number: req.params.num },
        include: { stats: true }
    });

    if (text) {
        await prisma.textStat.upsert({
            where: { textId: text.id },
            update: { viewCount: { increment: 1 } },
            create: { textId: text.id, viewCount: 1 }
        });
    }

    res.json(text);
});

// Get texts by difficulty (or remembered)

app.get('/api/texts/by-difficulty/:diff', async (req, res) => {
    const { diff } = req.params;
    let where;
    if (diff === 'hard') {
        where = { OR: [{ stats: { difficulty: 'hard' } }, { stats: { isFavorite: true } }] };
    } else if (diff === 'unknown') {
        where = { OR: [{ stats: { is: null } }, { stats: { difficulty: 'unknown' } }] };
    } else {
        where = { stats: { difficulty: diff } };
    }
        
    const texts = await prisma.bzfText.findMany({
        where: where,
        include: { stats: true },
        orderBy: { number: 'asc' }
    });
    res.json(texts);
});

// Rate a text
app.post('/api/texts/:id/rate', async (req, res) => {
    const textId = parseInt(req.params.id);
    const { difficulty, isFavorite } = req.body;
    
    const updateData = {};
    if (difficulty) {
        updateData.difficulty = difficulty;
        if (difficulty === 'easy') updateData.easyCount = { increment: 1 };
        if (difficulty === 'medium') updateData.mediumCount = { increment: 1 };
        if (difficulty === 'hard') updateData.hardCount = { increment: 1 };
    }
    if (isFavorite !== undefined) {
        updateData.isFavorite = isFavorite;
    }

    const stat = await prisma.textStat.upsert({
        where: { textId },
        update: updateData,
        create: { 
            textId, 
            difficulty: difficulty || 'unknown',
            isFavorite: isFavorite || false,
            easyCount: difficulty === 'easy' ? 1 : 0,
            mediumCount: difficulty === 'medium' ? 1 : 0,
            hardCount: difficulty === 'hard' ? 1 : 0
        }
    });
    res.json(stat);
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

    // English Text Stats
    const totalTexts = await prisma.bzfText.count();
    const ratedTexts = await prisma.textStat.count({
        where: { difficulty: { not: 'unknown' } }
    });
    const favoriteTexts = await prisma.textStat.count({
        where: { isFavorite: true }
    });
    const textViews = await prisma.textStat.aggregate({
        _sum: { viewCount: true }
    });

    res.json({
        totalQuestions,
        answeredQuestions,
        difficultCount,
        totalCorrect: stats._sum.correct || 0,
        totalIncorrect: stats._sum.incorrect || 0,
        recentExams: examResults,
        englishStats: {
            totalTexts,
            ratedTexts,
            favoriteTexts,
            totalViews: textViews._sum.viewCount || 0
        }
    });
});

// Reset Stats
app.post('/api/stats/reset', async (req, res) => {
    try {
        await prisma.userStat.deleteMany();
        await prisma.textStat.deleteMany();
        await prisma.examResult.deleteMany();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
