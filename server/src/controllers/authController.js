const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
    console.log('📩 Signup request body:', req.body); // debug log

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        throw new ApiError(400, 'Validation failed', errors.array());
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, 'Name, email and password are required');
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new ApiError(409, 'Email already registered. Please login.');
    }

    // Create user
    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
    });

    console.log('✅ User created:', user._id);

    const token = generateToken(user._id);

    res.status(201).json(
        new ApiResponse(201, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        }, 'Account created successfully')
    );
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
    console.log('📩 Login request body:', req.body); // debug log

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, 'Validation failed', errors.array());
    }

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    console.log('✅ Login successful:', user._id);

    res.json(
        new ApiResponse(200, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        }, 'Login successful')
    );
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json(new ApiResponse(200, user, 'User fetched'));
});

module.exports = { signup, login, getMe };