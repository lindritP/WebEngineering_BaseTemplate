import { z } from 'zod';

const MINLENGTH = 1;

export const BearSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/v),
  name: z.string().min(MINLENGTH),
  binomial: z.string().min(MINLENGTH),
  imageUrl: z.url().nullable(),
  range: z.string(),
});

export const BearListSchema = z.array(BearSchema);

export type Bear = z.infer<typeof BearSchema>;
