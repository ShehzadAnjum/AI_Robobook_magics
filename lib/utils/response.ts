/**
 * Utility functions for API responses
 */

export function jsonResponse(data: any, status: number = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function errorResponse(message: string, status: number = 500) {
  return jsonResponse(
    {
      error: message,
      timestamp: new Date().toISOString(),
    },
    status
  );
}

export function streamResponse(
  readable: ReadableStream,
  headers?: Record<string, string>
) {
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...headers,
    },
  });
}
