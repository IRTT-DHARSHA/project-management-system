const { z } = require('zod');

const PROJECT_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

const baseProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Project name is required').max(150),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    status: z.enum(PROJECT_STATUSES).optional(),
    startDate: z.string().trim().optional().or(z.literal('')).nullable(),
    endDate: z.string().trim().optional().or(z.literal('')).nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && Number.isNaN(Date.parse(data.startDate))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['startDate'], message: 'Invalid start date' });
    }
    if (data.endDate && Number.isNaN(Date.parse(data.endDate))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'Invalid end date' });
    }
    if (data.startDate && data.endDate && !Number.isNaN(Date.parse(data.startDate)) && !Number.isNaN(Date.parse(data.endDate))) {
      if (new Date(data.endDate) < new Date(data.startDate)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'End date cannot be before start date' });
      }
    }
  });

const createProjectSchema = baseProjectSchema;

const updateProjectSchema = baseProjectSchema;

module.exports = { createProjectSchema, updateProjectSchema, PROJECT_STATUSES };
