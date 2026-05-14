const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const prisma = new PrismaClient();
const PDF_PATH = process.env.PDF_PATH || '/data/questions.pdf';

async function seedQuestions() {
    const questionCount = await prisma.question.count();
    if (questionCount > 0) {
        console.log('Questions already exist. Skipping PDF seeding.');
        return;
    }

    if (!fs.existsSync(PDF_PATH)) {
        console.error('PDF file not found at:', PDF_PATH);
        return;
    }

    try {
        const dataBuffer = fs.readFileSync(PDF_PATH);
        const data = await pdfParse(dataBuffer);
        let text = data.text;
        
        text = text.replace(/Prüfungsfragen im Prüfungsteil[\s\S]*?BZF I/g, '');
        text = text.replace(/Stand: 2024 richtige Antwort immer A Seite \d+ von \d+ Seiten/g, '');
        text = text.replace(/\n\s*\n/g, '\n');

        const questions = [];
        const questionBlocks = text.split(/\n\s*(\d{1,3})\s*\n/);
        
        for (let i = 1; i < questionBlocks.length; i += 2) {
            const qNum = questionBlocks[i];
            const content = questionBlocks[i + 1];
            const parts = content.split(/\n\s*([A-D])\s*\n/);
            if (parts.length >= 9) {
                questions.push({
                    number: qNum.trim(),
                    text: parts[0].trim(),
                    options: [
                        { text: parts[2].trim(), isCorrect: true },
                        { text: parts[4].trim(), isCorrect: false },
                        { text: parts[6].trim(), isCorrect: false },
                        { text: parts[8].trim(), isCorrect: false },
                    ]
                });
            }
        }

        if (questions.length === 0) return;

        await prisma.examQuestion.deleteMany();
        await prisma.answer.deleteMany();
        await prisma.question.deleteMany();
        await prisma.exam.deleteMany();

        for (const q of questions) {
            await prisma.question.create({
                data: {
                    qNumber: q.number,
                    text: q.text,
                    category: 'All',
                    answers: { create: q.options }
                }
            });
        }

        const allStored = await prisma.question.findMany();
        for (let i = 1; i <= 5; i++) {
            const exam = await prisma.exam.create({ data: { name: `Prüfungssimulation ${i}` } });
            const shuffled = [...allStored].sort(() => Math.random() - 0.5);
            const examSet = shuffled.slice(0, 60);
            for (const q of examSet) {
                await prisma.examQuestion.create({ data: { examId: exam.id, questionId: q.id } });
            }
        }
        console.log('Questions seeded successfully.');
    } catch (error) {
        console.error('Error seeding questions:', error);
    }
}

async function seedTexts() {
    const textsPath = path.join(__dirname, 'bzf-texte.json');
    if (!fs.existsSync(textsPath)) {
        console.warn('bzf-texte.json not found at:', textsPath);
        return;
    }

    try {
        const textsData = JSON.parse(fs.readFileSync(textsPath, 'utf8'));
        for (const [num, data] of Object.entries(textsData)) {
            await prisma.bzfText.upsert({
                where: { number: num },
                update: {
                    textEn: data.en,
                    textDe: data.de
                },
                create: {
                    number: num,
                    textEn: data.en,
                    textDe: data.de
                }
            });
        }
        console.log(`Seeded ${Object.keys(textsData).length} BZF texts.`);
    } catch (error) {
        console.error('Error seeding texts:', error);
    }
}

async function main() {
    await seedQuestions();
    await seedTexts();
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
