require("dotenv/config")
const nodemailer = require("nodemailer")

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: JSON.parse(process.env.EMAIL),
    tls: {
        rejectUnauthorized: false
    },
    service: 'gmail'
})

module.exports = transporter

