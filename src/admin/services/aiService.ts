import { api } from './api';
import { z } from 'zod';

export const generateAIContent = async (prompt: string, systemPrompt: string = "You are a helpful admin assistant.", task: string = "chat") => {
  try {
    const response = await api.ai.generate({
      prompt: prompt,
      systemPrompt: systemPrompt,
      task: task
    });

    return response.content || response.result || response;
  } catch (error) {
    throw error;
  }
};

export const generateProductDescription = async (productName: string, features: string[]) => {
  const prompt = `Generate a compelling SEO-friendly product description for "${productName}" with these features: ${features.join(', ')}. Include 5 SEO tags at the end.`;
  return generateAIContent(prompt, "You are an expert copywriter and SEO specialist.", "write");
};

export const chatWithAssistant = async (message: string, contextData: string) => {
  // Pass contextData (Page Info) to the AI
  const systemContext = contextData ? `[Current Page Context]\n${contextData}\n\n` : "";
  const fullMessage = `${systemContext}${message}`;
  
  // Enforce Indonesian Language via System Prompt
  const systemPrompt = "Anda adalah asisten admin yang cerdas dan membantu. Anda WAJIB menjawab semua pertanyaan dalam BAHASA INDONESIA yang baik, benar, dan sopan. Gunakan format paragraf yang jelas. Jika diminta membuat konten, pastikan hasilnya siap pakai.";

  return generateAIContent(fullMessage, systemPrompt, "assistant");
};

const certificateExtractSchema = z.object({
  name: z.string().nullable().optional(),
  issuer: z.string().nullable().optional(),
  issueDate: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  credentialId: z.string().nullable().optional(),
  credentialUrl: z.string().nullable().optional(),
  verified: z.boolean().nullable().optional(),
});

const extractFirstJsonObject = (text: string) => {
  const cleaned = text
    .replace(/```json/gi, '```')
    .replace(/```/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    if (depth === 0) return cleaned.slice(start, i + 1);
  }
  return null;
};

export const extractCertificateFieldsFromText = async (ocrText: string) => {
  const trimmed = (ocrText || '').trim();
  if (!trimmed) {
    return {
      name: null,
      issuer: null,
      issueDate: null,
      expiryDate: null,
      credentialId: null,
      credentialUrl: null,
      verified: null,
    };
  }

  const systemPrompt = [
    "Anda adalah sistem ekstraksi data sertifikat.",
    "Tugas: dari teks OCR, ambil informasi sertifikat dan keluarkan JSON saja.",
    "Aturan keluaran:",
    "- Output HARUS berupa 1 objek JSON valid, tanpa teks tambahan.",
    "- Gunakan format tanggal YYYY-MM-DD jika ada.",
    "- Jika tidak yakin, isi null.",
    "Skema JSON:",
    "{",
    '  "name": string|null,',
    '  "issuer": string|null,',
    '  "issueDate": "YYYY-MM-DD"|null,',
    '  "expiryDate": "YYYY-MM-DD"|null,',
    '  "credentialId": string|null,',
    '  "credentialUrl": string|null,',
    '  "verified": boolean|null',
    "}",
  ].join('\n');

  const prompt = `Teks OCR sertifikat:\n\n${trimmed.slice(0, 12000)}`;
  const raw = await generateAIContent(prompt, systemPrompt, "extract");
  const jsonStr = extractFirstJsonObject(String(raw ?? ''));
  if (!jsonStr) {
    return {
      name: null,
      issuer: null,
      issueDate: null,
      expiryDate: null,
      credentialId: null,
      credentialUrl: null,
      verified: null,
    };
  }

  try {
    const parsed = JSON.parse(jsonStr);
    const validated = certificateExtractSchema.safeParse(parsed);
    if (!validated.success) {
      return {
        name: null,
        issuer: null,
        issueDate: null,
        expiryDate: null,
        credentialId: null,
        credentialUrl: null,
        verified: null,
      };
    }
    return validated.data;
  } catch {
    return {
      name: null,
      issuer: null,
      issueDate: null,
      expiryDate: null,
      credentialId: null,
      credentialUrl: null,
      verified: null,
    };
  }
};

export const extractCertificateFieldsFromImageDataUrl = async (imageDataUrl: string) => {
  const trimmed = (imageDataUrl || '').trim();
  if (!trimmed) {
    return {
      name: null,
      issuer: null,
      issueDate: null,
      expiryDate: null,
      credentialId: null,
      credentialUrl: null,
      verified: null,
    };
  }

  const raw = await api.ai.analyzeCertificateImage(trimmed);
  const content = raw?.content || raw?.result || raw;
  const jsonStr = extractFirstJsonObject(String(content ?? ''));
  if (!jsonStr) {
    return {
      name: null,
      issuer: null,
      issueDate: null,
      expiryDate: null,
      credentialId: null,
      credentialUrl: null,
      verified: null,
    };
  }

  try {
    const parsed = JSON.parse(jsonStr);
    const validated = certificateExtractSchema.safeParse(parsed);
    if (!validated.success) {
      return {
        name: null,
        issuer: null,
        issueDate: null,
        expiryDate: null,
        credentialId: null,
        credentialUrl: null,
        verified: null,
      };
    }
    return validated.data;
  } catch {
    return {
      name: null,
      issuer: null,
      issueDate: null,
      expiryDate: null,
      credentialId: null,
      credentialUrl: null,
      verified: null,
    };
  }
};
