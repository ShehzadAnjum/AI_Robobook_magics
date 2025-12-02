import { NextRequest } from 'next/server';
import { createAIProvider, type ChatMessage } from '@/lib/ai/providers';
import { errorResponse, jsonResponse } from '@/lib/utils/response';

export const runtime = 'edge';

interface TranslateRequest {
  text: string;
  targetLanguage?: string;
}

interface TranslateResponse {
  success: boolean;
  translation: string;
  originalText: string;
  targetLanguage: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: TranslateRequest = await request.json();
    const { text, targetLanguage = 'urdu' } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return errorResponse('Text is required', 400);
    }

    if (text.trim().length === 0) {
      return errorResponse('Text cannot be empty', 400);
    }

    if (text.length > 1000) {
      return errorResponse('Text too long (max 1000 characters)', 400);
    }

    // Create AI provider
    const aiProvider = createAIProvider();

    // Create translation prompt
    const prompt = `Translate the following English text to Urdu.
Provide ONLY the Urdu translation, without any explanations or additional text.
Use proper Urdu script and grammar.

Text to translate: "${text}"

Urdu translation:`;

    // Build message for chat
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    // Generate translation using non-streaming chat
    const translation = await aiProvider.chat(messages);

    // Build response
    const responseData: TranslateResponse = {
      success: true,
      translation: translation.trim(),
      originalText: text,
      targetLanguage,
    };

    // Return JSON response with CORS headers
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://shehzadanjum.github.io',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Translation error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return errorResponse(
          'Translation service configuration error. Please check API key.',
          500
        );
      }
      return errorResponse(error.message, 500);
    }

    return errorResponse('Translation failed. Please try again later.', 500);
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://shehzadanjum.github.io',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
