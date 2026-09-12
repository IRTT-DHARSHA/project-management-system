const { z } = require('zod');

const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const createTaskSchema = z
  .object({
    name: z.string().trim().min(1, 'Task name is required').max(150),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    priority: z.enum(TASK_PRIORITIES).optional(),
    status: z.enum(TASK_STATUSES).optional(),
    dueDate: z.string().trim().optional().or(z.literal('')).nullable(),
    projectId: z.string().trim().min(1, 'projectId is required'),
  })
  .superRefine((data, ctx) => {
    if (data.dueDate && Number.isNaN(Date.parse(data.dueDate))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dueDate'], message: 'Invalid due date' });
    }
  });

const updateTaskSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    priority: z.enum(TASK_PRIORITIES).optional(),
    status: z.enum(TASK_STATUSES).optional(),
    dueDate: z.string().trim().optional().or(z.literal('')).nullable(),
    projectId: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dueDate && Number.isNaN(Date.parse(data.dueDate))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dueDate'], message: 'Invalid due date' });
    }
  });

module.exports = { createTaskSchema, updateTaskSchema, TASK_PRIORITIES, TASK_STATUSES };
