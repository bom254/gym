const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    type: { type: String, required: true },
    notes: { type: String },
    exercises: [
        {
            name: { type: String, required: true },
            sets: { type: Number, required: true },
            reps: { type: Number, required: true },
            weight: { type: Number, default: 0 }
        }
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Workout', workoutSchema);
