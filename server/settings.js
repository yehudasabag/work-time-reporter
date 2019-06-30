
module.exports = {
    usersStorage: {
        containerName: process.env.USERS_CONTAINER || "isufitusers",
        storageAccount: process.env.USERS_STORAGE_ACCOUNT || "prodweugeneralreports",
        storageKey: process.env.USERS_STORAGE_KEY || "tCN/fyqM99vih/sUcNkiBXa7HeYpkmQX2H9/NVcORhEX+p3SuNjS85os1oKqwL0r7IlGuMDPzSFtuYfDk07uFQ=="
    },
    port: process.env.PORT || 3001,
    isufitUrl: process.env.ISUFIT_URL || 'http://ranad.co/biocatchclock/IsufitWS.asmx/AddMove',
    isufitProjectId: process.env.ISUFIT_PROJECT_ID || "1",
    email: {
        "smtpHost" : process.env.SMTP_HOST || "smtp.gmail.com",
        "smtpPort" : process.env.SMTP_PORT || 587,
        "smtpUser" : process.env.SMTP_USER_NAME  || "analyst.station.biocatch@gmail.com",
        "smtpPassword" : process.env.SMTP_PASSWORD|| "analyst@Biocatch01"
    },
    excludedDatesFileName: process.env.EXCLUDED_DATES_FILENAME || "excludedDates",
    doNotPostInDebug: false
};

