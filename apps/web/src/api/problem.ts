import { z } from 'zod';

const PROBLEM_CONTENT_TYPE = 'application/problem+json';
const REQUEST_ID_HEADER = 'x-request-id';

// RFC 9457 Problem Details as our API sends them. Only what the UI needs is
// required; unknown members (type, instance, errors, ...) are ignored.
const ProblemSchema = z.object({
  title: z.string(),
  status: z.number(),
  detail: z.string().optional(),
});

// A failed API request. `message` is the text meant for the user.
export class ApiError extends Error {
  readonly status: number;
  readonly requestId: string | null;

  constructor(message: string, status: number, requestId: string | null) {
    super(message);
    this.status = status;
    this.requestId = requestId;
  }
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Turns an error response into an ApiError. Only a real problem response
// carries a detail for the user; anything else (for example an HTML error
// page from a proxy when the API is down) gets a neutral text.
export async function toApiError(res: Response): Promise<ApiError> {
  const requestId = res.headers.get(REQUEST_ID_HEADER);
  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.startsWith(PROBLEM_CONTENT_TYPE)) {
    const result = ProblemSchema.safeParse(await readJson(res));
    if (result.success) {
      const {
        data: { detail, title },
      } = result;
      return new ApiError(detail ?? title, res.status, requestId);
    }
  }

  return new ApiError(
    `The server answered with status ${res.status}.`,
    res.status,
    requestId
  );
}

// Text for the UI: the API's detail plus the request id, which the user can
// quote when reporting the problem, so it can be found in the API log.
// Other errors (network down, unexpected data) get the caller's fallback.
export function errorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }
  return error.requestId === null
    ? error.message
    : `${error.message} (Request ID: ${error.requestId})`;
}
