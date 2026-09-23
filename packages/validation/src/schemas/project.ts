import { z } from "zod";

export const createProjectSchema = z.object({
  repositoryId: z.string().cuid(),
  name: z.string().min(1).max(100),
  rootDirectory: z.string().default("."),
  buildCommand: z.string().max(500).optional(),
  outputDirectory: z.string().max(255).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
