const { isUserRole } = require('../models/enums');

module.exports = function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    const normalizedAllowedRoles = allowedRoles.filter(isUserRole);

    if (!req.user || !isUserRole(req.user.role) || !normalizedAllowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
};
