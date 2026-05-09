const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      include: {
        project: {
          include: {
            _count: { select: { members: true, tasks: true } },
          },
        },
      },
      orderBy: { project: { updatedAt: 'desc' } },
    });

    const projects = memberships.map((m) => ({
      ...m.project,
      role: m.role,
    }));

    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        creatorId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        _count: { select: { members: true, tasks: true } },
      },
    });

    res.status(201).json({ project: { ...project, role: 'ADMIN' } });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ project: { ...project, role: req.membership.role } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
    });

    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:id/members
const inviteMember = async (req, res, next) => {
  try {
    const { email, role = 'MEMBER' } = req.body;
    const projectId = req.params.id;

    const userToInvite = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!userToInvite) {
      return res.status(404).json({ error: 'No user found with that email' });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: userToInvite.id, projectId } },
    });

    if (existing) {
      return res.status(409).json({ error: 'User is already a member' });
    }

    const membership = await prisma.projectMember.create({
      data: { userId: userToInvite.id, projectId, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ membership });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;

    // Prevent removing yourself if you are the only admin
    if (userId === req.user.id) {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the only admin' });
      }
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id/members/:userId/role
const updateMemberRole = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ error: 'Role must be ADMIN or MEMBER' });
    }

    const membership = await prisma.projectMember.update({
      where: { userId_projectId: { userId, projectId } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json({ membership });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
  updateMemberRole,
};
