const { validationResult } = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");

// Get all users (with role restrictions)
exports.getAllUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate("roles");
    const userRoles = currentUser.roles.map(role => role.name);

    // Build query based on user's permissions
    let query = {};
    
    // If user is admin, they can see all users
    if (userRoles.includes('admin')) {
      query = {};
    } 
    // If user is 1st_class_officer, they can see all users except admin and cfo
    else if (userRoles.includes('1st_class_officer')) {
      query = {
        'roles': {
          $not: {
            $elemMatch: {
              $in: await Role.find({ name: { $in: ['admin', 'cfo'] } }).distinct('_id')
            }
          }
        }
      };
    }
    // Other roles can only see themselves
    else {
      query = { _id: req.user.id };
    }

    const users = await User.find(query)
      .populate("roles")
      .select("-password -refreshTokens")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users,
        total: users.length
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate("roles");
    const userRoles = currentUser.roles.map(role => role.name);
    const targetUserId = req.params.id;

    // Check permissions
    if (!userRoles.includes('admin') && !userRoles.includes('1st_class_officer')) {
      if (targetUserId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to view this user",
        });
      }
    }

    const user = await User.findById(targetUserId)
      .populate("roles")
      .select("-password -refreshTokens");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Additional check for 1st_class_officer - can't view admin or cfo users
    if (userRoles.includes('1st_class_officer') && !userRoles.includes('admin')) {
      const targetUserRoles = user.roles.map(role => role.name);
      if (targetUserRoles.includes('admin') || targetUserRoles.includes('cfo')) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to view this user",
        });
      }
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const currentUser = await User.findById(req.user.id).populate("roles");
    const userRoles = currentUser.roles.map(role => role.name);

    // Check if user has permission to create users
    if (!userRoles.includes('admin') && !userRoles.includes('1st_class_officer')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to create users",
      });
    }

    const { name, email, password, roleNames, ...otherFields } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Validate and get roles
    let roles = [];
    if (roleNames && roleNames.length > 0) {
      roles = await Role.find({ name: { $in: roleNames } });
      if (roles.length !== roleNames.length) {
        return res.status(400).json({
          success: false,
          message: "One or more invalid roles specified",
        });
      }

      // Check role restrictions for 1st_class_officer
      if (userRoles.includes('1st_class_officer') && !userRoles.includes('admin')) {
        const restrictedRoles = ['admin', 'cfo'];
        const hasRestrictedRole = roles.some(role => restrictedRoles.includes(role.name));
        
        if (hasRestrictedRole) {
          return res.status(403).json({
            success: false,
            message: "You don't have permission to assign admin or CFO roles",
          });
        }
      }
    } else {
      // Default to fighter role if no roles specified
      const defaultRole = await Role.findOne({ name: "fighter" });
      if (defaultRole) {
        roles = [defaultRole];
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      roles: roles.map((role) => role._id),
      ...otherFields
    });

    // Populate roles for response
    await user.populate("roles");

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: user.toJSON()
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during user creation",
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const currentUser = await User.findById(req.user.id).populate("roles");
    const userRoles = currentUser.roles.map(role => role.name);
    const targetUserId = req.params.id;

    // Check permissions
    if (!userRoles.includes('admin') && !userRoles.includes('1st_class_officer')) {
      if (targetUserId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update this user",
        });
      }
    }

    const targetUser = await User.findById(targetUserId).populate("roles");
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Additional check for 1st_class_officer - can't update admin or cfo users
    if (userRoles.includes('1st_class_officer') && !userRoles.includes('admin')) {
      const targetUserRoles = targetUser.roles.map(role => role.name);
      if (targetUserRoles.includes('admin') || targetUserRoles.includes('cfo')) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update this user",
        });
      }
    }

    const { name, email, roleNames, password, ...otherFields } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== targetUser.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken",
        });
      }
    }

    // Handle role updates
    let roles = targetUser.roles;
    if (roleNames && roleNames.length > 0) {
      const newRoles = await Role.find({ name: { $in: roleNames } });
      if (newRoles.length !== roleNames.length) {
        return res.status(400).json({
          success: false,
          message: "One or more invalid roles specified",
        });
      }

      // Check role restrictions for 1st_class_officer
      if (userRoles.includes('1st_class_officer') && !userRoles.includes('admin')) {
        const restrictedRoles = ['admin', 'cfo'];
        const hasRestrictedRole = newRoles.some(role => restrictedRoles.includes(role.name));
        
        if (hasRestrictedRole) {
          return res.status(403).json({
            success: false,
            message: "You don't have permission to assign admin or CFO roles",
          });
        }
      }

      roles = newRoles;
    }

    // Update user
    const updateData = {
      name: name || targetUser.name,
      email: email || targetUser.email,
      roles: roles.map((role) => role._id),
      ...otherFields
    };

    // Handle password update separately
    if (password) {
      updateData.password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("roles");

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        user: updatedUser.toJSON()
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating user",
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate("roles");
    const userRoles = currentUser.roles.map(role => role.name);
    const targetUserId = req.params.id;

    // Check permissions
    if (!userRoles.includes('admin') && !userRoles.includes('1st_class_officer')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete users",
      });
    }

    // Prevent self-deletion
    if (targetUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const targetUser = await User.findById(targetUserId).populate("roles");
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Additional check for 1st_class_officer - can't delete admin or cfo users
    if (userRoles.includes('1st_class_officer') && !userRoles.includes('admin')) {
      const targetUserRoles = targetUser.roles.map(role => role.name);
      if (targetUserRoles.includes('admin') || targetUserRoles.includes('cfo')) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete this user",
        });
      }
    }

    await User.findByIdAndDelete(targetUserId);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

// Get available roles (with restrictions)
exports.getAvailableRoles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate("roles");
    const userRoles = currentUser.roles.map(role => role.name);

    let query = {};
    
    // 1st_class_officer can't see admin or cfo roles
    if (userRoles.includes('1st_class_officer') && !userRoles.includes('admin')) {
      query = { name: { $nin: ['admin', 'cfo'] } };
    }

    const roles = await Role.find(query).sort({ level: -1, name: 1 });

    res.json({
      success: true,
      data: {
        roles
      }
    });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching roles",
    });
  }
};
