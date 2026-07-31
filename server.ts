import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

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
- Si le niveau est CM1 ou CM2 et la matière est le Français, le programme officiel MENA est structuré en deux grands axes d'exploitation de texte :
  1) Exploitation de texte 1 : Vocabulaire et Orthographe.
  2) Exploitation de texte 2 : Grammaire et Conjugaison.
  Quand un élève de CM1 ou CM2 travaille en Français, réponds et formule tes exercices ou révisions en précisant explicitement à quel volet (Exploitation de texte 1 ou 2) appartient l'activité.
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

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Ivoir'Educ PRO running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

