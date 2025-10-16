const User = require('../models/User');

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('_id name email role mobile createdAt').lean();
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent admin from demoting themselves
    if (req.user && String(req.user._id) === String(id) && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot change your own admin role' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', user: { id: user._id, role: user.role } });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUsers, updateUserRole };
