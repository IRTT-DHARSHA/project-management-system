const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator');
const { getOwnedProjectOrFail } = require('./project.controller');

/**
 * Loads a task and verifies (via its parent project) that it belongs
 * to the authenticated user.
 */
const getOwnedTaskOrFail = async (taskId, userId) => {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
  if (!task || task.project.userId !== userId) {
    throw new ApiError(404, 'Task not found.');
  }
  return task;
};

// GET /api/tasks?search=&status=&priority=&projectId=
const getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, projectId } = req.query;

  const where = {
    project: { userId: req.user.id },
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(projectId ? { projectId: String(projectId) } : {}),
    ...(search ? { name: { contains: String(search), mode: 'insensitive' } } : {}),
  };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { project: { select: { id: true, name: true } } },
  });

  res.status(200).json(new ApiResponse(200, { tasks }, 'Tasks fetched successfully'));
});

// GET /api/tasks/:id
const getTaskById = asyncHandler(async (req, res) => {
  const task = await getOwnedTaskOrFail(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, { task }, 'Task fetched successfully'));
});

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const parsed = createTaskSchema.parse(req.body);

  // Ensure the target project belongs to the authenticated user
  await getOwnedProjectOrFail(parsed.projectId, req.user.id);

  const task = await prisma.task.create({
    data: {
      name: parsed.name,
      description: parsed.description || null,
      priority: parsed.priority || 'MEDIUM',
      status: parsed.status || 'PENDING',
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      projectId: parsed.projectId,
    },
  });

  res.status(201).json(new ApiResponse(201, { task }, 'Task created successfully'));
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const existing = await getOwnedTaskOrFail(req.params.id, req.user.id);
  const parsed = updateTaskSchema.parse(req.body);

  // If reassigning to a different project, verify ownership of that project too
  if (parsed.projectId && parsed.projectId !== existing.projectId) {
    await getOwnedProjectOrFail(parsed.projectId, req.user.id);
  }

  const task = await prisma.task.update({
    where: { id: existing.id },
    data: {
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.description !== undefined ? { description: parsed.description || null } : {}),
      ...(parsed.priority !== undefined ? { priority: parsed.priority } : {}),
      ...(parsed.status !== undefined ? { status: parsed.status } : {}),
      ...(parsed.dueDate !== undefined ? { dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null } : {}),
      ...(parsed.projectId !== undefined ? { projectId: parsed.projectId } : {}),
    },
  });

  res.status(200).json(new ApiResponse(200, { task }, 'Task updated successfully'));
});

// PATCH /api/tasks/:id/complete - convenience endpoint to mark a task completed
const completeTask = asyncHandler(async (req, res) => {
  const existing = await getOwnedTaskOrFail(req.params.id, req.user.id);
  const task = await prisma.task.update({
    where: { id: existing.id },
    data: { status: 'COMPLETED' },
  });
  res.status(200).json(new ApiResponse(200, { task }, 'Task marked as completed'));
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const existing = await getOwnedTaskOrFail(req.params.id, req.user.id);
  await prisma.task.delete({ where: { id: existing.id } });
  res.status(200).json(new ApiResponse(200, null, 'Task deleted successfully'));
});

module.exports = { getTasks, getTaskById, createTask, updateTask, completeTask, deleteTask };
