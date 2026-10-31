import { z } from 'zod';

export const ParseResponseSchema = z.object({
  parse: z.object({ wikitext: z.string() }),
});

export const ImageInfoResponseSchema = z.object({
  query: z.object({
    normalized: z
      .array(z.object({ from: z.string(), to: z.string() }))
      .optional(),
    pages: z.array(
      z.object({
        title: z.string(),
        imageinfo: z.array(z.object({ url: z.url() })).optional(),
      })
    ),
  }),
});
