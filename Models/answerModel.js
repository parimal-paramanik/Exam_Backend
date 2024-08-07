const mongoose = require("mongoose")

const questionSchema = mongoose.Schema({
    questionText: { type: String, required: true },
    options: [
        {
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true, default: false }
        }
    ],
}, { versionKey: false });

const questionModel = mongoose.model("question",questionSchema)

module.exports = {questionModel}
