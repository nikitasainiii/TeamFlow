const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Projects user is part of
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true, role: true },
    });
    const projectIds = memberships.map((m) => m.projectId);

    // Task stats across all projects
    const [todoCount, inProgressCount, doneCount, overdueCount] = await Promise.all([
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
      prisma.task.count({
        where: {
          projectId: { in: projectIds },
          status: { not: 'DONE' },
          dueDate: { lt: now },
        },
      }),
    ]);

    // My tasks (assigned to me)
    const myTasks = await prisma.task.findMany({
      where: { assigneeId: userId, status: { not: 'DONE' } },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      take: 10,
    });

    // Overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        status: { not: 'DONE' },
        dueDate: { lt: now },
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // Recent tasks
    const recentTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 8,
    });

    // Project summaries
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: {
        _count: { select: { members: true, tasks: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    });

    const projectsWithRole = projects.map((p) => {
      const m = memberships.find((m) => m.projectId === p.id);
      return { ...p, role: m?.role };
    });

    res.json({
      stats: {
        totalProjects: projectIds.length,
        totalTasks: todoCount + inProgressCount + doneCount,
        todoCount,
        inProgressCount,
        doneCount,
        overdueCount,
      },
      myTasks,
      overdueTasks,
      recentTasks,
      projects: projectsWithRole,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
