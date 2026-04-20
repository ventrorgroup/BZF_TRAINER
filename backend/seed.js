const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const prisma = new PrismaClient();
const PDF_PATH = process.env.PDF_PATH || '/data/questions.pdf';

async function seed() {
    console.log('Starting seed at path:', PDF_PATH);
    
    if (!fs.existsSync(PDF_PATH)) {
        console.error('PDF file not found at:', PDF_PATH);
        return;
    }

    try {
        const dataBuffer = fs.readFileSync(PDF_PATH);
        const data = await pdfParse(dataBuffer);
        let text = data.text;
        
        // Basic cleaning: Remove headers/footers
        // Header example: "Prüfungsfragen im Prüfungsteil..."
        // Footer example: "Stand: 2024 richtige Antwort immer A Seite 7 von 48 Seiten"
        text = text.replace(/Prüfungsfragen im Prüfungsteil[\s\S]*?BZF I/g, '');
        text = text.replace(/Stand: 2024 richtige Antwort immer A Seite \d+ von \d+ Seiten/g, '');
        text = text.replace(/\n\s*\n/g, '\n'); // Remove extra blank lines

        console.log('Cleaned text length:', text.length);

        const questions = [];
        
        // Improved Regex for the BNetzA PDF structure
        // Pattern: [\n] [number] [\n] [question text] [\n] A [\n] [option A text] [\n] B [\n] ...
        // We look for a number on its own line, followed by question text up to 'A' on its own line.
        const questionBlocks = text.split(/\n\s*(\d{1,3})\s*\n/);
        
        // split returns [prefix, num1, chunk1, num2, chunk2, ...]
        for (let i = 1; i < questionBlocks.length; i += 2) {
            const qNum = questionBlocks[i];
            const content = questionBlocks[i + 1];
            
            // Now parse the content chunk which contains: text \n A \n optA \n B \n ...
            const parts = content.split(/\n\s*([A-D])\s*\n/);
            if (parts.length >= 9) { // [text, 'A', optA, 'B', optB, 'C', optC, 'D', optD]
                questions.push({
                    number: qNum.trim(),
                    text: parts[0].trim().replace(/\s+/g, ' '),
                    options: [
                        { text: parts[2].trim().replace(/\s+/g, ' '), isCorrect: true },
                        { text: parts[4].trim().replace(/\s+/g, ' '), isCorrect: false },
                        { text: parts[6].trim().replace(/\s+/g, ' '), isCorrect: false },
                        { text: parts[8].trim().replace(/\s+/g, ' '), isCorrect: false },
                    ]
                });
            }
        }

        console.log(`Successfully parsed ${questions.length} questions.`);

        if (questions.length === 0) {
            console.log('Extraction failed. Check the text sample for patterns:');
            console.log(text.substring(2000, 4000));
            return;
        }

        // Clear existing data to avoid conflicts on re-run
        await prisma.examQuestion.deleteMany();
        await prisma.examResult.deleteMany();
        await prisma.userStat.deleteMany();
        await prisma.answer.deleteMany();
        await prisma.question.deleteMany();
        await prisma.exam.deleteMany();

        // Insert Questions & Answers
        for (const q of questions) {
            await prisma.question.create({
                data: {
                    qNumber: q.number,
                    text: q.text,
                    category: 'All',
                    answers: {
                        create: q.options
                    }
                }
            });
        }

        // Re-create Exams
        console.log('Generating Exam Simulations...');
        const allStored = await prisma.question.findMany();
        
        for (let i = 1; i <= 5; i++) {
            const exam = await prisma.exam.create({
                data: { name: `Prüfungssimulation ${i}` }
            });
            
            // Randomly pick 60 questions for each exam
            const shuffled = [...allStored].sort(() => Math.random() - 0.5);
            const examSet = shuffled.slice(0, 60);

            console.log(`Adding ${examSet.length} questions to ${exam.name}...`);
            
            for (const q of examSet) {
                await prisma.examQuestion.create({
                    data: {
                        examId: exam.id,
                        questionId: q.id
                    }
                });
            }
        }

        console.log('Database seeding finished.');
    } catch (error) {
        console.error('Fatal error during seeding:', error);
    }
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
