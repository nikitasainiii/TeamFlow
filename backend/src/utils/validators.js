const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  handleValidation,
];

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 300 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  handleValidation,
];

const updateTaskValidation = [
  body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty').isLength({ max: 300 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  handleValidation,
];

const inviteMemberValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('role').optional().isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
  handleValidation,
];

module.exports = {
  signupValidation,
  loginValidation,
  projectValidation,
  taskValidation,
  updateTaskValidation,
  inviteMemberValidation,
};
