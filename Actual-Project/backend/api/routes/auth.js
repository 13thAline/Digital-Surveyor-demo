import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone, city, state, address } = req.body;

        if (!name || !email || !password || !city || !state) {
            return res.status(400).json({
                error: 'Name, email, password, city, and state are required.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters.'
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'An account with this email already exists.'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone: phone || null,
                city,
                state,
                address: address || null
            }
        });

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                city: user.city,
                state: user.state
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                state: user.state,
                address: user.address,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account.' });
    }
});

/**
 * POST /auth/login
 * Authenticate user and return JWT
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required.'
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                city: user.city,
                state: user.state
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                state: user.state,
                address: user.address,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed.' });
    }
});

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                state: true,
                address: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ success: true, user });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data.' });
    }
});

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, phone, city, state, address } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name && { name }),
                ...(phone !== undefined && { phone }),
                ...(city && { city }),
                ...(state && { state }),
                ...(address !== undefined && { address })
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                state: true,
                address: true,
                createdAt: true
            }
        });

        res.json({ success: true, user });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
});

export default router;
