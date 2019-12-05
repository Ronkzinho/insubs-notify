const mongoose = require("mongoose")

var StateSchema = new mongoose.Schema({
    serieName: String,
    serie: Object,
    status: String
})

module.exports = mongoose.model('State', StateSchema)