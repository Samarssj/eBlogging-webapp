# Gemini API integration notes

Verified against the official Google AI for Developers documentation on 2026-08-24.

- REST endpoint: `POST https://generativelanguage.googleapis.com/v1beta/{model=models/*}:generateContent`
- Request body uses `contents[]` with `parts[].text`; optional `systemInstruction` and `generationConfig` are supported.
- Successful response is a `GenerateContentResponse`; generated text is available in the first candidate's content parts, and the official text-generation documentation also exposes a convenience `response.text` in SDK examples.
- API-key access is available through Google AI Studio; the server integration must keep the key private and send it only from the backend.
- The existing app has a Node/Express backend and React/Vite frontend. The new endpoint should be server-side and should degrade gracefully to local sample suggestions when `GEMINI_API_KEY` is not configured so the feature remains reviewable locally.

## Dynamic model selection

The official models.list endpoint is `GET https://generativelanguage.googleapis.com/v1beta/models`. Model metadata includes `supportedGenerationMethods`, `baseModelId`, and `name`. The backend filters for models supporting `generateContent`, ranks compatible Gemini Flash and Pro models by numeric version, caches the selected model for 15 minutes, and uses `GEMINI_FALLBACK_MODEL`—defaulting to the `gemini-flash-latest` alias—if discovery is unavailable. The previous `GEMINI_MODEL_FALLBACK` name remains accepted for backward compatibility. Reference: https://ai.google.dev/api/models and https://ai.google.dev/gemini-api/docs/models.
