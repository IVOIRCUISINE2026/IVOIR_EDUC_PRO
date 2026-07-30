import { GoogleGenAI, Modality } from "@google/genai";
import { LearningMode, ChatMessage as TypeChatMessage } from "../types";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Type definitions moved to types.ts

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export const generateSpeech = async (text: string, language: string = "fr") => {
  if (!apiKey) return null;

  // Aggressive cleaning for TTS stability
  let cleanText = text
    // Remove emojis
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Remove markdown symbols
    .replace(/[*#_`~|>]/g, ' ')
    // Remove markdown links but keep text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove mathematical symbols that might confuse TTS
    .replace(/[\\{}[\]]/g, ' ')
    // Replace multiple newlines/spaces
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText || cleanText.length < 2) return null;
  
  // Limit length for TTS stability per chunk
  cleanText = cleanText.substring(0, 600);

  const voiceName = language === "en" ? "Zephyr" : 
                    language === "es" ? "Charon" :
                    language === "de" ? "Puck" : "Kore";

  const maxRetries = 3; // Increased retries
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      const base64Audio = parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (base64Audio) return base64Audio;
      
      // Check if it was blocked or something else returned
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
        throw new Error(`No audio data in response (Finish reason: ${finishReason})`);
      }
      
      throw new Error("No audio data in response (Empty content)");
    } catch (error: any) {
      attempt++;
      
      let errorMessage = "";
      try {
        errorMessage = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
      } catch (e) {
        errorMessage = String(error);
      }

      const isQuotaError = 
        errorMessage.includes("quota") || 
        errorMessage.includes("429") || 
        errorMessage.includes("RESOURCE_EXHAUSTED");
      
      if (isQuotaError) {
        console.warn("TTS Quota exceeded. Returning QUOTA_EXCEEDED status.");
        return "QUOTA_EXCEEDED";
      }

      // Determine if error is transient or candidate for retry
      const isTransientError = 
        errorMessage.includes("500") || 
        errorMessage.includes("503") || 
        errorMessage.includes("Internal error") ||
        errorMessage.includes("No audio data") ||
        errorMessage.includes("empty response") ||
        errorMessage.includes("Rpc failed") ||
        errorMessage.includes("xhr error") ||
        errorMessage.includes("6") || // Error code 6 in the log
        errorMessage.includes("UNKNOWN");

      // Only log on final failure or if it's not a transient error
      if (attempt > maxRetries || !isTransientError) {
        console.error(`TTS Final Error (Attempt ${attempt}):`, errorMessage);
      } else {
        console.warn(`TTS Transient Error (Attempt ${attempt}): ${(errorMessage || "").substring(0, 100)}. Retrying...`);
      }
      
      // Retry on transient issues with exponential backoff
      if (attempt <= maxRetries && isTransientError) {
        const delay = Math.pow(2, attempt) * 1000 + (Math.random() * 500); // 2s, 4s, 8s + jitter
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return null;
    }
  }
  return null;
};

export const generateEducationalContentStream = async (
  mode: LearningMode,
  grade: string,
  subject: string,
  prompt: string,
  history: ChatMessage[] = [],
  onChunk: (text: string) => void,
  chapter?: string,
  fileData?: { data: string, mimeType: string }
) => {
  if (!apiKey) {
    onChunk("Erreur : La clé API Gemini n'est pas configurée. Veuillez l'ajouter dans les paramètres.");
    return;
  }

  const systemInstruction = `
    Tu es "IvoirEduc Pro", un assistant pédagogique expert certifié conforme au programme du Ministère de l'Éducation Nationale et de l'Alphabétisation (MENA) de Côte d'Ivoire.
    
    CONTEXTE ACTUEL:
    - Niveau scolaire: ${grade}
    - Matière: ${subject}
    - Chapitre/Thème actuel: ${chapter || "Non spécifié"}
    - Mode: ${mode}
    - Fondateur: Jean Cyrille AHORET
    - Standard académique: Approche Par Compétences (APC)
    
    RÈGLES DE COMPORTEMENT:
    1. Toujours vérifier le niveau sélectionné (${grade}) avant de générer un contenu.
    2. Pour le mode "Questions Quiz" :
       - Génère une série de 5 à 10 questions à choix multiples (QCM) ou questions à réponse courte sur le chapitre spécifié.
       - Les questions doivent être variées : compréhension, application, analyse.
       - Fournis les réponses à la fin, masquées ou séparées clairement.
       - Adapte la difficulté au niveau (${grade}).
    3. Pour le mode "Interrogations et devoirs", génère des sujets conformes au format APC (Approche Par Compétences) de Côte d'Ivoire :
       - Structure : 
         a) Exercice 1 : Restitution de connaissances (5-6 points).
         b) Exercice 2 : Application des connaissances (6-7 points).
         c) Exercice 3 : Situation d'évaluation / Résolution de problème (7-8 points).
       - Inclus toujours un barème précis sur 20 points.
       - Adapte la difficulté selon s'il s'agit d'une "Interrogation" (courte, 15-20 min) ou d'un "Devoir" (long, 1h-2h).
       - Ne génère QUE le sujet, pas le corrigé (sauf si demandé explicitement).
    4. Pour le mode "Corrections des Évaluations", fournis des corrigés détaillés et pédagogiques pour les exercices soumis ou types.
    5. Pour le mode "Parler à un Conseiller", tu agis comme un conseiller d'orientation scolaire et professionnelle ivoirien.
       - Ton rôle est d'écouter, de rassurer et de guider l'élève.
       - Utilise des informations précises sur le système éducatif ivoirien (Séries A, C, D, E, G, etc.).
       - Propose des méthodes de travail concrètes (gestion du temps, fiches, mémorisation).
       - Oriente vers les universités (UFHB, UNA, UJLoG, etc.) et grandes écoles (INP-HB, ENS, etc.) de Côte d'Ivoire selon le profil.
       - Sois particulièrement attentif aux inquiétudes liées aux examens nationaux.
    6. Pour le mode "Fiches de révisions" :
       - Génère un résumé structuré et synthétique du chapitre spécifié.
       - Structure : 
         a) Introduction/Définition.
         b) Points clés du cours (formules, dates, concepts).
         c) Exemples d'application.
         d) Mots-clés essentiels pour l'examen.
       - IMPORTANT : Ne génère AUCUNE image ou illustration.
       - Adapte le contenu au niveau (${grade}) et à la matière (${subject}).
    7. Pour le mode "Examens Blancs" :
       - Ce mode est réservé aux classes d'examen (CM2 -> CEPE, 3ème -> BEPC, Terminale -> BAC).
       - Génère un sujet complet respectant STRICTEMENT le format officiel national de Côte d'Ivoire.
       - Pour le BAC, précise la série (A, C, D) selon le niveau sélectionné.
       - Inclus tous les exercices, les textes d'appui et le barème officiel.
    9. Utilise un ton encourageant, professionnel et pédagogique.
    10. Réponds en Markdown structuré avec des emojis pour la clarté.
    11. Si l'élève pose une question hors du programme MENA, recadre poliment vers les objectifs scolaires.
    12. IMPORTANT : Si tu ne connais pas un chapitre spécifique, demande des précisions au lieu d'inventer.
    13. ANALYSE DE FICHIER : Si l'utilisateur fournit une image ou un document (PDF), analyse son contenu pour l'aider dans son apprentissage, expliquer un exercice ou corriger un travail.
  `;

  const lastMessageParts: any[] = [{ text: prompt }];
  if (fileData) {
    lastMessageParts.unshift({
      inlineData: {
        data: fileData.data.includes(',') ? fileData.data.split(',')[1] : fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  const contents = [
    ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: lastMessageParts }
  ];

  const maxRetries = 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      let fullText = "";
      for await (const chunk of response) {
        if (chunk.text) {
          fullText += chunk.text;
          onChunk(fullText);
        }
      }

      if (!fullText) {
        throw new Error("Réponse vide de l'IA");
      }

      return fullText;
    } catch (error: any) {
      attempt++;
      console.error(`Gemini API Error (Attempt ${attempt}):`, error);
      
      const errorMessage = error?.message || "";
      
      // If it's a quota error or transient error, retry after a short delay
      if (attempt <= maxRetries && (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("500") || errorMessage.includes("503"))) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      let finalError = "";
      if (errorMessage.includes("403") || error?.status === 403) {
        finalError = "⚠️ Erreur de permission (403) : Votre clé API n'a pas les droits nécessaires ou le modèle est restreint.";
      } else if (errorMessage.includes("API_KEY_INVALID")) {
        finalError = "⚠️ Clé API invalide : Veuillez vérifier la configuration de votre clé Gemini.";
      } else if (errorMessage.includes("quota") || errorMessage.includes("429")) {
        finalError = "⚠️ Quota dépassé : Trop de requêtes en peu de temps. Veuillez patienter une minute.";
      } else {
        finalError = `⚠️ Une erreur est survenue : ${errorMessage || "Erreur de connexion au service d'IA"}. Veuillez réessayer.`;
      }
      
      onChunk(finalError);
      return finalError;
    }
  }
  return "⚠️ Échec après plusieurs tentatives.";
};

export const generateEducationalContent = async (
  mode: LearningMode,
  grade: string,
  subject: string,
  prompt: string,
  history: ChatMessage[] = [],
  chapter?: string,
  fileData?: { data: string, mimeType: string }
) => {
  if (!apiKey) {
    return "Erreur : La clé API Gemini n'est pas configurée. Veuillez l'ajouter dans les paramètres.";
  }

  const systemInstruction = `
    Tu es "IvoirEduc Pro", un assistant pédagogique expert certifié conforme au programme du Ministère de l'Éducation Nationale et de l'Alphabétisation (MENA) de Côte d'Ivoire.
    
    CONTEXTE ACTUEL:
    - Niveau scolaire: ${grade}
    - Matière: ${subject}
    - Chapitre/Thème actuel: ${chapter || "Non spécifié"}
    - Mode: ${mode}
    - Fondateur: Jean Cyrille AHORET
    - Standard académique: Approche Par Compétences (APC)
    
    RÈGLES DE COMPORTEMENT:
    1. Toujours vérifier le niveau sélectionné (${grade}) avant de générer un contenu.
    2. Pour le mode "Questions Quiz" :
       - Génère une série de 5 à 10 questions à choix multiples (QCM) ou questions à réponse courte sur le chapitre spécifié.
       - Les questions doivent être variées : compréhension, application, analyse.
       - Fournis les réponses à la fin, masquées ou séparées clairement.
       - Adapte la difficulté au niveau (${grade}).
    3. Pour le mode "Interrogations et devoirs", génère des sujets conformes au format APC (Approche Par Compétences) de Côte d'Ivoire :
       - Structure : 
         a) Exercice 1 : Restitution de connaissances (5-6 points).
         b) Exercice 2 : Application des connaissances (6-7 points).
         c) Exercice 3 : Situation d'évaluation / Résolution de problème (7-8 points).
       - Inclus toujours un barème précis sur 20 points.
       - Adapte la difficulté selon s'il s'agit d'une "Interrogation" (courte, 15-20 min) ou d'un "Devoir" (long, 1h-2h).
       - Ne génère QUE le sujet, pas le corrigé (sauf si demandé explicitement).
    4. Pour le mode "Corrections des Évaluations", fournis des corrigés détaillés et pédagogiques pour les exercices soumis ou types.
    5. Pour le mode "Parler à un Conseiller", tu agis comme un conseiller d'orientation scolaire et professionnelle ivoirien.
       - Ton rôle est d'écouter, de rassurer et de guider l'élève.
       - Utilise des informations précises sur le système éducatif ivoirien (Séries A, C, D, E, G, etc.).
       - Propose des méthodes de travail concrètes (gestion du temps, fiches, mémorisation).
       - Oriente vers les universités (UFHB, UNA, UJLoG, etc.) et grandes écoles (INP-HB, ENS, etc.) de Côte d'Ivoire selon le profil.
       - Sois particulièrement attentif aux inquiétudes liées aux examens nationaux.
    6. Pour le mode "Fiches de révisions" :
       - Génère un résumé structuré et synthétique du chapitre spécifié.
       - Structure : 
         a) Introduction/Définition.
         b) Points clés du cours (formules, dates, concepts).
         c) Exemples d'application.
         d) Mots-clés essentiels pour l'examen.
       - IMPORTANT : Ne génère AUCUNE image ou illustration.
       - Adapte le contenu au niveau (${grade}) et à la matière (${subject}).
    7. Pour le mode "Examens Blancs" :
       - Ce mode est réservé aux classes d'examen (CM2 -> CEPE, 3ème -> BEPC, Terminale -> BAC).
       - Génère un sujet complet respectant STRICTEMENT le format officiel national de Côte d'Ivoire.
       - Pour le BAC, précise la série (A, C, D) selon le niveau sélectionné.
       - Inclus tous les exercices, les textes d'appui et le barème officiel.
    9. Utilise un ton encourageant, professionnel et pédagogique.
    10. Réponds en Markdown structuré avec des emojis pour la clarté.
    11. Si l'élève pose une question hors du programme MENA, recadre poliment vers les objectifs scolaires.
    12. IMPORTANT : Si tu ne connais pas un chapitre spécifique, demande des précisions au lieu d'inventer.
    13. ANALYSE DE FICHIER : Si l'utilisateur fournit une image ou un document (PDF), analyse son contenu pour l'aider dans son apprentissage, expliquer un exercice ou corriger un travail.
  `;

  const lastMessageParts: any[] = [{ text: prompt }];
  if (fileData) {
    lastMessageParts.unshift({
      inlineData: {
        data: fileData.data.includes(',') ? fileData.data.split(',')[1] : fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  const contents = [
    ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: lastMessageParts }
  ];

  const maxRetries = 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (!response || !response.text) {
        throw new Error("Réponse vide de l'IA");
      }

      return response.text;
    } catch (error: any) {
      attempt++;
      console.error(`Gemini API Error (Attempt ${attempt}):`, error);
      
      const errorMessage = error?.message || "";
      
      if (attempt <= maxRetries && (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("500") || errorMessage.includes("503"))) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      if (errorMessage.includes("403") || error?.status === 403) {
        return "⚠️ Erreur de permission (403) : Votre clé API n'a pas les droits nécessaires ou le modèle est restreint.";
      }
      
      if (errorMessage.includes("API_KEY_INVALID")) {
        return "⚠️ Clé API invalide : Veuillez vérifier la configuration de votre clé Gemini.";
      }

      if (errorMessage.includes("quota") || errorMessage.includes("429")) {
        return "⚠️ Quota dépassé : Trop de requêtes en peu de temps. Veuillez patienter une minute.";
      }
      
      return `⚠️ Une erreur est survenue : ${errorMessage || "Erreur de connexion au service d'IA"}. Veuillez réessayer.`;
    }
  }
  return "⚠️ Échec après plusieurs tentatives.";
};
