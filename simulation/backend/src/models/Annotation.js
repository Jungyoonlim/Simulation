const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
    modelId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: Object, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Annotation', annotationSchema);
