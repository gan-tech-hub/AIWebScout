import { NextResponse, type NextRequest } from 'next/server';

function allowedOrigins(): Set<string> {
  return new Set(
    (process.env.CHROME_EXTENSION_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

export function applyCors(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins().has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  }
  return response;
}

export function corsPreflight(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type',
  );
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, OPTIONS',
  );
  response.headers.set('Access-Control-Max-Age', '600');
  return applyCors(request, response);
}
