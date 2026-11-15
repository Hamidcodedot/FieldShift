/**
 * Vercel Serverless Function: /api/chat
 * Proxies Green Roots Agronomist AI requests to Google Gemini 2.5 Flash
 * while keeping GEMINI_API_KEY strictly on the server.
 */

interface IncomingRequest {
  method?: string;
  body?: {
    query?: string;
    history?: Array<{ role: 'user' | 'model'; text: string }>;
    context?: {
      farmName?: string;
      placeName?: string;
      latitude?: number;
      longitude?: number;
      currentCrop?: string;
      sowingDate?: string;
      daysElapsed?: number | null;
      growthStage?: string;
      soilTexture?: string;
      soilOrganicMatter?: number;
      irrigationMethod?: string;
      tempC?: number;
      annualPrecipitationMm?: number;
      rootZoneWetnessPercent?: number;
      droughtRiskPercent?: number;
      strategyTitle?: string;
      nitrogenSavedBags?: number;
      waterSavedM3?: number;
      rotationSequence?: string[];
    };
  };
}

interface OutgoingResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => OutgoingResponse;
  json: (data: unknown) => void;
  end: () => void;
}

const GEMINI_MODEL = 'gemini-2.5-flash';

function setCorsHeaders(res: OutgoingResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function buildAgronomistSystemPrompt(ctx: NonNullable<IncomingRequest['body']>['context']): string {
  const c = ctx || {};
  const coords =
    typeof c.latitude === 'number' && typeof c.longitude === 'number'
      ? `${c.latitude.toFixed(4)}°, ${c.longitude.toFixed(4)}°`
      : 'Not specified';

  const rotationLine =
    Array.isArray(c.rotationSequence) && c.rotationSequence.length > 0
      ? c.rotationSequence.join(' -> ')
      : 'Not specified';

  return `You are the Green Roots Senior Agronomist — an expert in precision agronomy, FAO-56 irrigation scheduling, biological nitrogen fixation, integrated pest management, and climate-resilient crop rotation.

COMMUNICATION STANDARDS:
- Speak like a trusted, seasoned field agronomist: direct, respectful, practical, and free of filler or fluff.
- Zero emojis. Use clean Markdown with concise bullet points and bold action headers.
- Respond in the same language the farmer writes in (default to clear English).
- Keep responses focused and actionable (typically 120-200 words) unless the farmer asks for a detailed breakdown.
- Ground every recommendation in the exact field and NASA satellite figures below. Never fabricate sensor readings or unverified numbers.
- If data is missing or uncertain, state it plainly and recommend a practical field check (e.g., hand-feel soil moisture test or local extension check).

ACTIVE FIELD & NASA EARTH OBSERVATION CONTEXT:
- Field Name: ${c.farmName || 'Active Farm'}
- Location: ${c.placeName || 'Farm Location'} (${coords})
- Current Standing Crop: ${c.currentCrop || 'Not specified'}
- Sowing Date: ${c.sowingDate || 'Not specified'}${typeof c.daysElapsed === 'number' ? ` (${c.daysElapsed} days elapsed)` : ''}
- Current Phenological Stage: ${c.growthStage || 'Not specified'}
- Soil Texture: ${c.soilTexture || 'Loam'} | Soil Organic Matter: ${c.soilOrganicMatter ?? 1.2}%
- Irrigation System: ${c.irrigationMethod || 'Not specified'}
- NASA POWER / Root-Zone Telemetry:
  - 2m Air Temperature: ${c.tempC ?? 'N/A'}°C
  - Annual Precipitation: ${c.annualPrecipitationMm ?? 'N/A'} mm
  - Root-Zone Soil Wetness (0-100cm): ${c.rootZoneWetnessPercent ?? 'N/A'}%
  - Historical Drought Risk: ${c.droughtRiskPercent ?? 'N/A'}%
- Active 3-Year / 6-Season Rotation Plan: ${c.strategyTitle || 'Soil Regenerator'}
  - Sequence: ${rotationLine}
  - Projected 3-Year Urea Savings: ~${c.nitrogenSavedBags ?? 0} bags (50 kg)
  - Projected 3-Year Water Savings: ~${c.waterSavedM3 ?? 0} m³/ha`;
}

export default async function handler(req: IncomingRequest, res: OutgoingResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    return;
  }

  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
  if (!query) {
    res.status(400).json({ error: 'Query is required.' });
    return;
  }

  if (query.length > 2000) {
    res.status(400).json({ error: 'Query exceeds maximum length of 2000 characters.' });
    return;
  }

  const systemInstruction = buildAgronomistSystemPrompt(req.body?.context);

  const historyContents = Array.isArray(req.body?.history)
    ? req.body.history
        .slice(-6)
        .filter((m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'model'))
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text.slice(0, 1500) }],
        }))
    : [];

  const contents = [
    ...historyContents,
    {
      role: 'user',
      parts: [{ text: query }],
    },
  ];

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const upstream = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 550,
        },
      }),
    });

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => '');
      console.error(`Gemini API error (${upstream.status}):`, errBody.slice(0, 300));
      res.status(502).json({ error: 'Upstream AI service unavailable.' });
      return;
    }

    const data = await upstream.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      res.status(502).json({ error: 'Empty response from AI service.' });
      return;
    }

    res.status(200).json({ reply, model: GEMINI_MODEL });
  } catch (err) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
