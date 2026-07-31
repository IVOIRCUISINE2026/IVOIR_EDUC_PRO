import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Route for AI Chat / Pedagogical Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, grade, subject, mode, history, fileData } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "Clé API Gemini non configurée. Veuillez ajouter GEMINI_API_KEY dans vos paramètres d'environnement." 
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Tu es l'assistant IA officiel d'Ivoir'Educ PRO ("Apprendre • Comprendre • Réussir"), spécialement conçu pour les élèves de Côte d'Ivoire suivant le programme certifié du Ministère de l'Éducation Nationale et de l'Alphabétisation (MENA).

Règles de comportement:
- Adapte tes explications au niveau de l'élève (actuellement: ${grade || '3ème'}).
- La matière actuellement sélectionnée est: ${subject || 'Mathématiques'}.
- Le mode d'apprentissage est: ${mode || 'Interrogations et devoirs'}.
- Sois très encourageant, pédagogique, clair et structuré.
- Utilise la mise en forme Markdown avec des puces, du gras, du code ou des formules scientifiques si besoin.
- Propose des exercices pratiques avec leurs corrections détaillées quand nécessaire.
- Fais référence aux réalités et au système éducatif de Côte d'Ivoire (BEPC, BAC A/C/D, CEPE, coefficients, méthodologies MENA).`;

    let contentsParts: any[] = [];

    if (fileData && fileData.data && fileData.mimeType) {
      contentsParts.push({
        inlineData: {
          data: fileData.data,
          mimeType: fileData.mimeType,
        },
      });
    }

    contentsParts.push({
      text: prompt || "Explique-moi cette leçon de façon claire et vivante.",
    });

    // Stream response using SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.6-flash',
      contents: { parts: contentsParts },
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Erreur API Chat Gemini:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Une erreur est survenue lors de la communication avec l'IA." });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// Serve static files in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server Ivoir'Educ PRO running on port ${PORT}`);
});
