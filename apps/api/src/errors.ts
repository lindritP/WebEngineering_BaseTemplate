export class UpstreamError extends Error {
  readonly statusCode = 502;
}

export class UpstreamTimeoutError extends Error {
  readonly statusCode = 504;
}

export class NotFoundError extends Error {
  readonly statusCode = 404;
}

export class ValidationError extends Error {
  readonly statusCode = 400;
}

//
// 502 Bad Gateway: Wikipedia ist nicht erreichbar, antwortet mit einem Fehler oder liefert etwas Unerwartetes.
// 504 Gateway Timeout: Wikipedia hat nicht rechtzeitig geantwortet.
// 404 Not Found: Für /api/bears/:id mit einer unbekannten ID.
