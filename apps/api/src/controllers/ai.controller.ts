import { Request, Response, NextFunction } from 'express';
import { generateAIResponse } from '../services/ai.service';
import { createError } from '../middleware/error.middleware';

export async function chatAssistant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      next(createError('Messages array required', 400));
      return;
    }

    const response = await generateAIResponse(messages, 'chat');
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
}

export async function summarizeMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { messages } = req.body;
    const response = await generateAIResponse(
      messages.map((m: any) => ({ role: 'user', content: `${m.senderName}: ${m.content}` })),
      'summary'
    );
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
}

export async function smartReplies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message } = req.body;
    const response = await generateAIResponse(
      [{ role: 'user', content: message }],
      'reply'
    );
    let replies: string[] = [];
    try {
      replies = JSON.parse(response.content);
    } catch {
      replies = ["👍", "Interesting!", "Tell me more"];
    }
    res.json({ success: true, data: { replies } });
  } catch (error) {
    next(error);
  }
}

export async function grammarFix(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { text } = req.body;
    const response = await generateAIResponse([{ role: 'user', content: text }], 'grammar');
    res.json({ success: true, data: { corrected: response.content } });
  } catch (error) {
    next(error);
  }
}

export async function translateText(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { text, targetLang = 'en' } = req.body;
    const response = await generateAIResponse(
      [{ role: 'user', content: `Translate to ${targetLang}: ${text}` }],
      'translation'
    );
    res.json({ success: true, data: { translated: response.content, targetLang } });
  } catch (error) {
    next(error);
  }
}