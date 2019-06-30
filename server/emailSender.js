"use strict";

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const settings = require('./settings');

class EmailSender{
    constructor() {
        let smtpOptions =new smtpTransport({
            pool: true, // for reuse connections in order to send multiple emails on the same connection
            host: settings.email.smtpHost,
            port: settings.email.smtpPort,
            auth: {
                user: settings.email.smtpUser,
                pass: settings.email.smtpPassword
            }
        });
        this._transporter = nodemailer.createTransport(smtpOptions);
    }

    sendEmail(msg, email, subject) {
        let mailOptions = {
            to: email, // list of receivers
            subject: `BioCatch Isufit Automation: ${subject} `, // Subject line
            html: `<div>Hi ${email},</div>
            <div>${msg}</div>
            <br/>
            <div>Donated by Yehuda Sabag for BioCatch employees and for the happiness of Keren Hila-Dor :)</div>`
        };
        this._transporter.sendMail(mailOptions, err => {
            if (err) {
                console.log(`Failed to send mail to ${email} with message ${subject}: ${err}`);
            }
            else {
                console.log(`Successfulyy sent mail to ${email} with message ${subject}`);
            }
        });
    }
}

module.exports = new EmailSender();