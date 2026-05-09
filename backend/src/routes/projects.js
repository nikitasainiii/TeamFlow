const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
  updateMemberRole,
} = require('../controllers/projects');
const { authenticate } = require('../middleware/auth');
const { requireMember, requireAdmin } = require('../middleware/projectRole');
const { projectValidation, inviteMemberValidation } = require('../utils/validators');

// Project CRUD
router.get('/', authenticate, getProjects);
router.post('/', authenticate, projectValidation, createProject);
router.get('/:id', authenticate, requireMember, getProject);
router.put('/:id', authenticate, requireMember, requireAdmin, projectValidation, updateProject);
router.delete('/:id', authenticate, requireMember, requireAdmin, deleteProject);

// Member management
router.post('/:id/members', authenticate, requireMember, requireAdmin, inviteMemberValidation, inviteMember);
router.delete('/:id/members/:userId', authenticate, requireMember, requireAdmin, removeMember);
router.put('/:id/members/:userId/role', authenticate, requireMember, requireAdmin, updateMemberRole);

module.exports = router;
