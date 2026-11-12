import { z } from 'zod';
import type Bear from '../types.ts';
import { toApiError } from './problem.ts';

// The API already validates its output, but the browser cannot know that:
// a different API version or a proxy error page would be just as unknown.
// Typed as z.ZodType<Bear>, so the schema cannot drift from the interface.
const BearSchema: z.ZodType<Bear> = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  binomial: z.string().nonempty(),
  imageUrl: z.url().nullable(),
  range: z.string(),
});

const BearListSchema = z.array(BearSchema);

export async function fetchBears(signal: AbortSignal): Promise<Bear[]> {
  const res = await fetch('/api/bears', { signal });
  if (!res.ok) {
    throw await toApiError(res);
  }
  const result = BearListSchema.safeParse(await res.json());
  if (!result.success) {
    throw new Error('Unexpected response from the API', {
      cause: result.error,
    });
  }
  return result.data;
}
