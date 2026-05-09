const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/projects/:projectId/tasks
const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigneeId } = req.query;

    const where = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:projectId/tasks
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    // Validate assignee is a project member
    if (assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId } },
      });
      if (!assigneeMember) {
        return res.status(400).json({ error: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:projectId/tasks/:taskId
const updateTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Members can only update status of their own assigned tasks
    if (req.membership.role === 'MEMBER') {
      if (task.assigneeId !== req.user.id) {
        return res.status(403).json({ error: 'You can only update tasks assigned to you' });
      }
      // Members can only change status, not other fields
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: { status },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true, email: true } },
        },
      });
      return res.json({ task: updated });
    }

    // Validate assignee is a project member
    if (assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId } },
      });
      if (!assigneeMember) {
        return res.status(400).json({ error: 'Assignee must be a project member' });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:projectId/tasks/:taskId
const deleteTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;

    const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
