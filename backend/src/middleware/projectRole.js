const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware to check if the authenticated user is a member of the project.
 * Attaches req.membership to the request.
 */
const requireMember = async (req, res, next) => {
  try {
    const { projectId, id: paramId } = req.params;
    const pid = projectId || paramId;

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: pid,
        },
      },
      include: { project: true },
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    req.membership = membership;
    req.project = membership.project;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to check if the authenticated user is an Admin in the project.
 * Must be used AFTER requireMember.
 */
const requireAdmin = (req, res, next) => {
  if (req.membership.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { requireMember, requireAdmin };
