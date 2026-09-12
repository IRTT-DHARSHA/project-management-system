const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// GET /api/dashboard/stats
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalProjects, projectsInProgress, projectsCompleted, tasks, recentProjects, recentTasks] =
    await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.findMany({ where: { project: { userId } }, select: { status: true } }),
      prisma.project.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.task.findMany({
        where: { project: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { project: { select: { id: true, name: true } } },
      }),
    ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalProjects,
          projectsInProgress,
          projectsCompleted,
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
        },
        recentProjects,
        recentTasks,
      },
      'Dashboard stats fetched successfully'
    )
  );
});

module.exports = { getStats };
