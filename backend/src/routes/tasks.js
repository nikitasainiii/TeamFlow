const express = require('express');
const router = express.Router({ mergeParams: true });
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/tasks');
const { authenticate } = require('../middleware/auth');
const { requireMember, requireAdmin } = require('../middleware/projectRole');
const { taskValidation, updateTaskValidation } = require('../utils/validators');

router.get('/:projectId/tasks', authenticate, requireMember, getTasks);
router.post('/:projectId/tasks', authenticate, requireMember, requireAdmin, taskValidation, createTask);
router.put('/:projectId/tasks/:taskId', authenticate, requireMember, updateTaskValidation, updateTask);
router.delete('/:projectId/tasks/:taskId', authenticate, requireMember, requireAdmin, deleteTask);

module.exports = router;
