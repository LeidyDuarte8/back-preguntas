// controllers/questionController.js
import OpenAI from 'openai';
import dotenv from 'dotenv';
import Question from '../models/Question.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateQuestions = async (req, res) => {
  const { topic } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'El tema es requerido' });
  }

  try {
    const prompt = `
    Crea 5 preguntas tipo trivia sobre el tema: ${topic}.
    Cada una con 4 opciones (1 correcta y 3 incorrectas).
    Devuelve un array JSON con objetos:
    { "question": "texto", "options": ["A", "B", "C", "D"] }
    Sin explicaciones, solo el JSON.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Devuelve solo JSON, sin explicaciones." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 700,
    });

    const rawText = completion.choices[0].message.content.trim();

    let preguntas;
    try {
      preguntas = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(500).json({
        error: "No se pudo interpretar el JSON generado.",
        raw: rawText,
      });
    }

    // Guardar cada pregunta en MongoDB
    const savedQuestions = [];
    for (const p of preguntas) {
      const newQuestion = new Question({
        topic,
        question: p.question,
        options: p.options,
      });
      await newQuestion.save();
      savedQuestions.push(newQuestion);
    }

    res.json({ savedQuestions });
  } catch (error) {
    console.error('Error generando o guardando preguntas:', error);
    res.status(500).json({ error: 'Error interno al generar preguntas' });
  }
};
