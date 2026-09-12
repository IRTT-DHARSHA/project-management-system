const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { createProjectSchema, updateProjectSchema } = require('../validators/project.validator');

/**
 * Loads a project and verifies it belongs to the authenticated user.
 * Throws 404 if missing, and never reveals whether a project exists
 * for a different user (also returns 404 in that case) so IDs cannot
 * be used to probe other users' data.
 */
const getOwnedProjectOrFail = async (projectId, userId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== userId) {
    throw new ApiError(404, 'Project not found.');
  }
  return project;
};

// GET /api/projects?search=&status=
const getProjects = asyncHandler(async (req, res) => {
  const { search, status } = req.query;

  const where = {
    userId: req.user.id,
    ...(status ? { status } : {}),
    ...(search
      ? { name: { contains: String(search), mode: 'insensitive' } }
      : {}),
  };

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { tasks: true } } },
  });

  res.status(200).json(new ApiResponse(200, { projects }, 'Projects fetched successfully'));
});

// GET /api/projects/:id
const getProjectById = asyncHandler(async (req, res) => {
  const project = await getOwnedProjectOrFail(req.params.id, req.user.id);
  const fullProject = await prisma.project.findUnique({
    where: { id: project.id },
    include: { tasks: { orderBy: { createdAt: 'desc' } } },
  });
  res.status(200).json(new ApiResponse(200, { project: fullProject }, 'Project fetched successfully'));
});

// POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const parsed = createProjectSchema.parse(req.body);

  const project = await prisma.project.create({
    data: {
      name: parsed.name,
      description: parsed.description || null,
      status: parsed.status || 'NOT_STARTED',
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      userId: req.user.id,
    },
  });

  res.status(201).json(new ApiResponse(201, { project }, 'Project created successfully'));
});

// PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const existing = await getOwnedProjectOrFail(req.params.id, req.user.id);
  const parsed = updateProjectSchema.parse(req.body);

  const project = await prisma.project.update({
    where: { id: existing.id },
    data: {
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.description !== undefined ? { description: parsed.description || null } : {}),
      ...(parsed.status !== undefined ? { status: parsed.status } : {}),
      ...(parsed.startDate !== undefined ? { startDate: parsed.startDate ? new Date(parsed.startDate) : null } : {}),
      ...(parsed.endDate !== undefined ? { endDate: parsed.endDate ? new Date(parsed.endDate) : null } : {}),
    },
  });

  res.status(200).json(new ApiResponse(200, { project }, 'Project updated successfully'));
});

// DELETE /api/projects/:id
// Cascading delete is configured in the Prisma schema (onDelete: Cascade),
// so deleting a project automatically removes its related tasks.
const deleteProject = asyncHandler(async (req, res) => {
  const existing = await getOwnedProjectOrFail(req.params.id, req.user.id);
  await prisma.project.delete({ where: { id: existing.id } });
  res.status(200).json(new ApiResponse(200, null, 'Project and its tasks deleted successfully'));
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getOwnedProjectOrFail,
};
