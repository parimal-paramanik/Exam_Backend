const mongoose = require("mongoose");

const scoreSchema = mongoose.Schema({
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    examname: { type: String, required: true },
    score: { type: Number, required: true },
    result:{ type: Boolean, default: 'fail' },
}, 
{ versionKey: false });

const scoreModel = mongoose.model("score", scoreSchema);

module.exports = { scoreModel };
