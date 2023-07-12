import express from "express";
import db from "../db/connection.mjs";
import {ObjectId} from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const router = express.Router();
const secretKey = process.env.SECRET_KEY;
const saltRounds = 10;

router.post('/users/register', async (req, res) => {
    try {
        const { name, password, role, boss } = req.body;

        if (role !== 'regular' && role !== 'administrator') {
            return res.status(400).json({ error: 'Role should be regular or administrator'})
        }

        if (!name || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await db.collection('users').findOne({ name: name });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this name already exists' });
        }

        if (role === 'administrator') {
            const existingAdmin = await db.collection('users').findOne({ role: 'administrator' });
            if (existingAdmin) {
                return res.status(409).json({ error: 'Admin already exists' });
            }
        } else {
            let bossUser;
            if (boss) {
                bossUser = await db.collection('users').findOne({ name: boss });
                if (!bossUser) {
                    return res.status(404).json({ error: 'Boss with that name have`nt found' });
                }
            } else {
                    return res.status(401).json({ error: 'Boss is required' });
            }

            if (bossUser.role !== "administrator") {
                bossUser.role = 'boss';
                await db.collection('users').updateOne({ _id: bossUser._id }, { $set: bossUser });
            }
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = { name: name, password: hashedPassword, role: role, boss: boss || null };

        await db.collection('users').insertOne(user);

        return res.status(201).json({ message: 'User successfully registered' });
    } catch (err) {
        console.error('Error while saving user:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});


router.post('/users/authenticate', async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const user = await db.collection('users').findOne({ name: name });
        if (!user) {
            return res.status(401).json({ error: 'Wrong name or user is`nt exist' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Wrong password' });
        }

        const token = jwt.sign({ name: user.name, role: user.role }, secretKey,
            { expiresIn: '1h', algorithm: 'HS256' });

        return res.status(200).json({ token: token });
    } catch (err) {
        console.error('Error while finding user:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

router.get('/users', async (req, res) => {
    try {
        let token
        if (req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1];
        } else {
            return res.status(401).json({ error: 'Auth token is required' });
        }

        const decoded = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
        const { name, role } = decoded;

        let users;
        if (role === 'administrator') {
            users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
        } else if (role === 'boss') {
            users = await db.collection('users').find(
                { $or: [{ name: name }, { boss: name }] },
                { projection: { password: 0 } }
            ).toArray();
        } else {
            users = [await db.collection('users').findOne({ name: name }, { projection: { password: 0 } })];
        }

        return res.status(200).json({ users: users });
    } catch (err) {
        console.error('Error while getting users:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

router.patch('/users/:userId/boss', async (req, res) => {
    try {
        let token
        if (req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1];
        } else {
            return res.status(401).json({ error: 'Auth token is required' });
        }

        const decoded = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
        const { role, name: bossName } = decoded;

        if (role !== 'boss' || role !== 'administrator') {
            return res.status(403).json({ error: 'You don`t have permission for this action' });
        }

        const { userId } = req.params;
        const { newBoss } = req.body;

        const checkBoss = await db.collection('users').findOne({ name: newBoss });
        if (!checkBoss) {
            return res.status(401).json({ error: 'Wrong name or boss is`nt exist' });
        }

        const updatedUser = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(userId), boss: bossName },
            { $set: { boss: newBoss } },
            { returnDocument: 'after' }
        );

        if (!updatedUser.value) {
            return res.status(404).json({ error: 'User not found or you can`t change his boss' });
        }

        return res.status(200).json({ message: 'Boss successfully changed' });
    } catch (err) {
        console.error('Error while updating user:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

export default router;
