module.exports = {
  port: process.env.PORT || 3011,
  logLevel: 'debug',
  email: {
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: process.env.SMTP_PORT || 587,
    smtpUser: process.env.SMTP_USER_NAME || "work.time.reporter@gmail.com",
    smtpPassword: process.env.SMTP_PASSWORD
  },
  doNotPostInDebug: false
};
