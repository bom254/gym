const express = require('express');
const Workout = require('../models/Workout');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Protect all workout routes with authentication middleware
router.use(authenticateToken);

// Create workout
router.post('/', async (req, res) => {
    try {
        const workoutData = req.body;
        workoutData.userId = req.userId;
        const workout = new Workout(workoutData);
        await workout.save();
        res.status(201).json(workout);
    } catch (error) {
        console.error('Create workout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all workouts for user
router.get('/', async (req, res) => {
    try {
        const workouts = await Workout.find({ userId: req.userId }).sort({ date: -1 });
        res.status(200).json(workouts);
    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete workout by id
router.delete('/:id', async (req, res) => {
    try {
        const workoutId = req.params.id;
        await Workout.deleteOne({ _id: workoutId, userId: req.userId });
        res.status(200).json({ message: 'Workout deleted' });
    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
