/**
 * AI Service
 * Integrates with OpenAI/Anthropic for chat assistant features
 * Falls back to mock responses if no API key is configured
 */
import axios from 'axios';
import { logger } from '../config/logger';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface AIResponse {
  content: string;
  type: 'text' | 'summary' | 'grammar' | 'translation' | 'reply';
}

export async function generateAIResponse(
  messages: Array<{ role: string; content: string }>,
  type: string = 'chat'
): Promise<AIResponse> {
  if (!OPENAI_API_KEY) {
    return getMockResponse(type, messages);
  }

  try {
    const systemPrompts: Record<string, string> = {
      chat: 'You are a helpful AI assistant in a messaging app. Keep responses concise (under 100 words) and friendly.',
      summary: 'Summarize the following conversation in 2-3 bullet points. Be concise.',
      grammar: 'Fix any grammar/spelling errors in the following text. Only return the corrected text.',
      translation: 'Translate the following text to English if it is in another language, or to the detected language if in English. Only return the translation.',
      reply: 'Suggest 3 short reply options for this message. Return as a JSON array of strings.',
      moderation: 'Analyze this message for toxicity/spam. Return ONLY "safe" or "flagged".',
    };

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompts[type] || systemPrompts.chat },
          ...messages,
        ],
        max_tokens: type === 'reply' ? 150 : 300,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return {
      content: response.data.choices[0].message.content,
      type: type as AIResponse['type'],
    };
  } catch (error) {
    logger.error('AI service error:', error);
    return getMockResponse(type, messages);
  }
}

export async function moderateMessage(content: string): Promise<boolean> {
  const result = await generateAIResponse(
    [{ role: 'user', content }],
    'moderation'
  );
  return result.content.toLowerCase().includes('flagged');
}

function getMockResponse(type: string, messages: any[]): AIResponse {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  const mocks: Record<string, string> = {
    chat: "I'm here to help! What would you like to know about this conversation?",
    summary: '• Main topic discussed\n• Key decisions made\n• Action items identified',
    grammar: lastMessage,
    translation: lastMessage,
    reply: '["Sounds good!", "I agree with that.", "Can you elaborate?"]',
    moderation: 'safe',
  };

  return { content: mocks[type] || mocks.chat, type: type as AIResponse['type'] };
}