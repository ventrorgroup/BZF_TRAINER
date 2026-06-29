const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const APP_PASSWORD = 'BZF-Trainer-8jK9-mP4q';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'BZF-Admin-2026';

// Safe wrapper for async express handlers to prevent unhandled rejections / process crashes
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper to format a question (flattens stats array to single object or null)
function formatQuestion(question) {
    if (!question) return null;
    const stats = question.stats && question.stats.length > 0 ? question.stats[0] : null;
    return {
        ...question,
        stats: stats
    };
}

// Helper to format a text (flattens stats array to single object or null)
function formatText(text) {
    if (!text) return null;
    const stats = text.stats && text.stats.length > 0 ? text.stats[0] : null;
    return {
        ...text,
        stats: stats
    };
}

// Database self-healing / migration logic
async function initializeMultiTenant() {
    try {
        console.log('Initializing multi-tenant database alignment...');
        const defaultGuid = 'default-account-guid';
        let defaultAccount = await prisma.account.findUnique({
            where: { guid: defaultGuid }
        });
        if (!defaultAccount) {
            defaultAccount = await prisma.account.create({
                data: {
                    guid: defaultGuid,
                    name: 'Standard-Account'
                }
            });
            console.log('Default account created.');
        }

        // Migrate any existing stats that don't have an accountId
        const migratedStats = await prisma.userStat.updateMany({
            where: { accountId: null },
            data: { accountId: defaultAccount.id }
        });
        if (migratedStats.count > 0) {
            console.log(`Migrated ${migratedStats.count} UserStat rows to default account.`);
        }

        const migratedTextStats = await prisma.textStat.updateMany({
            where: { accountId: null },
            data: { accountId: defaultAccount.id }
        });
        if (migratedTextStats.count > 0) {
            console.log(`Migrated ${migratedTextStats.count} TextStat rows to default account.`);
        }

        const migratedResults = await prisma.examResult.updateMany({
            where: { accountId: null },
            data: { accountId: defaultAccount.id }
        });
        if (migratedResults.count > 0) {
            console.log(`Migrated ${migratedResults.count} ExamResult rows to default account.`);
        }
        
        console.log('Database initialization completed.');
    } catch (err) {
        console.error('Error during database initialization:', err);
    }
}

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

// Admin Authentication Middleware
const adminAuthMiddleware = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const adminPass = req.headers['x-admin-password'];
    if (adminPass === ADMIN_PASSWORD) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
};

// Account middleware (scopes requests to a specific account)
const accountMiddleware = asyncHandler(async (req, res, next) => {
    const accountGuid = req.headers['x-account-guid'];
    let account;
    
    if (accountGuid) {
        account = await prisma.account.findUnique({
            where: { guid: accountGuid }
        });
    }
    
    if (!account) {
        // Fallback to the default account
        account = await prisma.account.findUnique({
            where: { guid: 'default-account-guid' }
        });
    }
    
    if (!account) {
        return res.status(500).json({ error: 'System error: Default account could not be found.' });
    }
    
    req.accountId = account.id;
    req.account = account;
    next();
});

// Public Login Endpoint
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === APP_PASSWORD) {
        return res.json({ success: true, token: APP_PASSWORD });
    }
    return res.status(401).json({ success: false, error: 'Ungültiges Passwort' });
});

// Protect all /api/ paths except login and admin auth
app.use((req, res, next) => {
    if (req.path === '/api/auth/login' || req.path === '/api/admin/auth') {
        return next();
    }
    if (req.path.startsWith('/api/admin')) {
        return next();
    }
    if (req.path.startsWith('/api')) {
        return authMiddleware(req, res, next);
    }
    next();
});

// Apply account scoping middleware to non-admin /api/ paths
app.use((req, res, next) => {
    if (req.path.startsWith('/api') && !req.path.startsWith('/api/admin') && req.path !== '/api/auth/login') {
        return accountMiddleware(req, res, next);
    }
    next();
});

// Return current active account details
app.get('/api/auth/current-account', (req, res) => {
    res.json({
        guid: req.account.guid,
        name: req.account.name
    });
});

// Get random question
app.get('/api/questions/random', asyncHandler(async (req, res) => {
    const count = await prisma.question.count();
    if (count === 0) return res.json(null);
    const skip = Math.floor(Math.random() * count);
    const question = await prisma.question.findFirst({
        skip: skip,
        include: {
            answers: true,
            stats: {
                where: { accountId: req.accountId }
            }
        }
    });
    res.json(formatQuestion(question));
}));

// Get question by its qNumber (sequential)
app.get('/api/questions/by-number/:num', asyncHandler(async (req, res) => {
    const question = await prisma.question.findFirst({
        where: { qNumber: req.params.num },
        include: {
            answers: true,
            stats: {
                where: { accountId: req.accountId }
            }
        }
    });
    res.json(formatQuestion(question));
}));

// Get unsure questions (incorrect > correct)
app.get('/api/questions/unsure', asyncHandler(async (req, res) => {
    const questions = await prisma.question.findMany({
        where: {
            stats: {
                some: {
                    accountId: req.accountId,
                    incorrect: { gt: prisma.userStat.fields.correct }
                }
            }
        },
        include: {
            answers: true,
            stats: {
                where: { accountId: req.accountId }
            }
        },
        take: 20
    });
    res.json(questions.map(q => formatQuestion(q)));
}));

// Update question stats (answers)
app.post('/api/answers', asyncHandler(async (req, res) => {
    const { questionId, isCorrect } = req.body;
    const stat = await prisma.userStat.upsert({
        where: {
            accountId_questionId: {
                accountId: req.accountId,
                questionId
            }
        },
        update: {
            correct: isCorrect ? { increment: 1 } : undefined,
            incorrect: !isCorrect ? { increment: 1 } : undefined,
        },
        create: {
            accountId: req.accountId,
            questionId,
            correct: isCorrect ? 1 : 0,
            incorrect: !isCorrect ? 1 : 0,
        }
    });
    res.json(stat);
}));

// Toggle difficult flag
app.post('/api/questions/:id/toggle-flag', asyncHandler(async (req, res) => {
    const questionId = parseInt(req.params.id);
    const { isDifficult } = req.body;
    const stat = await prisma.userStat.upsert({
        where: {
            accountId_questionId: {
                accountId: req.accountId,
                questionId
            }
        },
        update: { isDifficult },
        create: {
            accountId: req.accountId,
            questionId,
            isDifficult
        }
    });
    res.json(stat);
}));

// Get difficult questions
app.get('/api/questions/difficult', asyncHandler(async (req, res) => {
    const questions = await prisma.question.findMany({
        where: {
            stats: {
                some: {
                    accountId: req.accountId,
                    isDifficult: true
                }
            }
        },
        include: {
            answers: true,
            stats: {
                where: { accountId: req.accountId }
            }
        }
    });
    res.json(questions.map(q => formatQuestion(q)));
}));

// --- BZF English Texts ---

// Get random BZF text
app.get('/api/texts/random', asyncHandler(async (req, res) => {
    const count = await prisma.bzfText.count();
    if (count === 0) return res.json(null);
    const skip = Math.floor(Math.random() * count);
    const text = await prisma.bzfText.findFirst({
        skip: skip,
        include: {
            stats: {
                where: { accountId: req.accountId }
            }
        }
    });

    if (text) {
        await prisma.textStat.upsert({
            where: {
                accountId_textId: {
                    accountId: req.accountId,
                    textId: text.id
                }
            },
            update: { viewCount: { increment: 1 } },
            create: {
                accountId: req.accountId,
                textId: text.id,
                viewCount: 1
            }
        });
        
        const updatedText = await prisma.bzfText.findUnique({
            where: { id: text.id },
            include: {
                stats: {
                    where: { accountId: req.accountId }
                }
            }
        });
        return res.json(formatText(updatedText));
    }

    res.json(null);
}));

// Get BZF text by its number
app.get('/api/texts/by-number/:num', asyncHandler(async (req, res) => {
    const text = await prisma.bzfText.findFirst({
        where: { number: req.params.num },
        include: {
            stats: {
                where: { accountId: req.accountId }
            }
        }
    });

    if (text) {
        await prisma.textStat.upsert({
            where: {
                accountId_textId: {
                    accountId: req.accountId,
                    textId: text.id
                }
            },
            update: { viewCount: { increment: 1 } },
            create: {
                accountId: req.accountId,
                textId: text.id,
                viewCount: 1
            }
        });
        
        const updatedText = await prisma.bzfText.findUnique({
            where: { id: text.id },
            include: {
                stats: {
                    where: { accountId: req.accountId }
                }
            }
        });
        return res.json(formatText(updatedText));
    }

    res.json(null);
}));

// Get texts by difficulty
app.get('/api/texts/by-difficulty/:diff', asyncHandler(async (req, res) => {
    const { diff } = req.params;
    let where;
    if (diff === 'hard') {
        where = {
            stats: {
                some: {
                    accountId: req.accountId,
                    OR: [
                        { difficulty: 'hard' },
                        { isFavorite: true }
                    ]
                }
            }
        };
    } else if (diff === 'unknown') {
        where = {
            OR: [
                {
                    stats: {
                        none: {
                            accountId: req.accountId
                        }
                    }
                },
                {
                    stats: {
                        some: {
                            accountId: req.accountId,
                            difficulty: 'unknown'
                        }
                    }
                }
            ]
        };
    } else {
        where = {
            stats: {
                some: {
                    accountId: req.accountId,
                    difficulty: diff
                }
            }
        };
    }
        
    const texts = await prisma.bzfText.findMany({
        where: where,
        include: {
            stats: {
                where: { accountId: req.accountId }
            }
        },
        orderBy: { number: 'asc' }
    });
    res.json(texts.map(t => formatText(t)));
}));

// Rate a text
app.post('/api/texts/:id/rate', asyncHandler(async (req, res) => {
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
        where: {
            accountId_textId: {
                accountId: req.accountId,
                textId
            }
        },
        update: updateData,
        create: { 
            accountId: req.accountId,
            textId, 
            difficulty: difficulty || 'unknown',
            isFavorite: isFavorite || false,
            easyCount: difficulty === 'easy' ? 1 : 0,
            mediumCount: difficulty === 'medium' ? 1 : 0,
            hardCount: difficulty === 'hard' ? 1 : 0
        }
    });
    res.json(stat);
}));

// Exams
app.get('/api/exams', asyncHandler(async (req, res) => {
    const exams = await prisma.exam.findMany({
        include: {
            results: {
                where: { accountId: req.accountId }
            }
        }
    });
    // Format to retain the expected _count key
    const formattedExams = exams.map(exam => {
        const { results, ...rest } = exam;
        return {
            ...rest,
            _count: { results: results.length }
        };
    });
    res.json(formattedExams);
}));

app.get('/api/exams/:id', asyncHandler(async (req, res) => {
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
    res.json(exam);
}));

app.post('/api/exams/:id/result', asyncHandler(async (req, res) => {
    const { score } = req.body;
    const result = await prisma.examResult.create({
        data: {
            accountId: req.accountId,
            examId: parseInt(req.params.id),
            score
        }
    });
    res.json(result);
}));

// Dashboard Statistics
app.get('/api/stats/dashboard', asyncHandler(async (req, res) => {
    const totalQuestions = await prisma.question.count();
    const stats = await prisma.userStat.aggregate({
        where: { accountId: req.accountId },
        _sum: {
            correct: true,
            incorrect: true
        }
    });
    
    const answeredQuestions = await prisma.userStat.count({
        where: { accountId: req.accountId }
    });
    const difficultCount = await prisma.userStat.count({
        where: { accountId: req.accountId, isDifficult: true }
    });

    const examResults = await prisma.examResult.findMany({
        where: { accountId: req.accountId },
        take: 5,
        orderBy: { date: 'desc' }
    });

    // English Text Stats
    const totalTexts = await prisma.bzfText.count();
    const ratedTexts = await prisma.textStat.count({
        where: { accountId: req.accountId, difficulty: { not: 'unknown' } }
    });
    const favoriteTexts = await prisma.textStat.count({
        where: { accountId: req.accountId, isFavorite: true }
    });
    const textViews = await prisma.textStat.aggregate({
        where: { accountId: req.accountId },
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
}));

// Reset Stats
app.post('/api/stats/reset', asyncHandler(async (req, res) => {
    try {
        await prisma.userStat.deleteMany({ where: { accountId: req.accountId } });
        await prisma.textStat.deleteMany({ where: { accountId: req.accountId } });
        await prisma.examResult.deleteMany({ where: { accountId: req.accountId } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}));

// --- BZF Sprechfunk Simulationen ---
app.get('/api/sprechfunk', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'sprechfunk-simulationen.json');
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Simulations data not found' });
        }
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ADMIN API ENDPOINTS ---

// Admin Login
app.post('/api/admin/auth', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        return res.json({ success: true, token: ADMIN_PASSWORD });
    }
    return res.status(401).json({ success: false, error: 'Ungültiges Admin-Passwort' });
});

// Get all accounts
app.get('/api/admin/accounts', adminAuthMiddleware, asyncHandler(async (req, res) => {
    const accounts = await prisma.account.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    userStats: true,
                    examResults: true,
                    textStats: true
                }
            }
        }
    });
    res.json(accounts);
}));

// Create new account
app.post('/api/admin/accounts', adminAuthMiddleware, asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name ist erforderlich' });
    }
    const newAccount = await prisma.account.create({
        data: {
            name: name.trim()
        }
    });
    res.json(newAccount);
}));

// Delete account
app.delete('/api/admin/accounts/:id', adminAuthMiddleware, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await prisma.account.delete({
        where: { id }
    });
    res.json({ success: true });
}));

// Express Global Error Handler to catch all unhandled errors cleanly
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ 
        error: 'Interner Serverfehler', 
        details: err.message 
    });
});
// Function to run migrations and seeding with retries
async function runMigrationsAndSeed(retries = 15, delay = 5000) {
    const { exec } = require('child_process');
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Running database migrations (attempt ${i + 1}/${retries})...`);
            await new Promise((resolve, reject) => {
                exec('npx prisma db push', (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(stderr || error.message));
                    } else {
                        resolve(stdout);
                    }
                });
            });
            console.log('Database migrations completed successfully.');
            
            // Seed database questions
            console.log('Running database seeding...');
            await new Promise((resolve, reject) => {
                exec('node seed.js', (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(stderr || error.message));
                    } else {
                        resolve(stdout);
                    }
                });
            });
            console.log('Database seeding completed successfully.');
            return;
        } catch (err) {
            console.error(`Migration/Seed attempt ${i + 1} failed:`, err.message);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay / 1000}s...`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    throw new Error('All migration/seeding attempts failed.');
}

const PORT = process.env.PORT || 3000;

// Start Express server immediately to prevent 502 Bad Gateway
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Run database migrations and seeding in the background, then align multi-tenant
    runMigrationsAndSeed().then(() => {
        return initializeMultiTenant();
    }).catch(err => {
        console.error('Database migration/initialization failed:', err);
    });
});
