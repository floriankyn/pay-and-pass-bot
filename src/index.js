//index.js// -- created by Florian Lepage 11/09/2020

// node.js imports
const fs = require("fs");
const time = date => `${new Date(date).getHours()}:${new Date(date).getMinutes()}:${new Date(date).getSeconds()}`;

// discord.js init
const discord = require("discord.js");
const client = new discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']});

// json imports
const config = JSON.parse(fs.readFileSync("./config/config.json"));
const language = JSON.parse(fs.readFileSync("./language/en-US.json"));

// Database imports (Located to ./database/)
const {Database} = require("./database/Database.js");

// Class imports
const {StaffManager} = require("./action/administration/StaffManager.js");
const {Utils} = require("./action/everyone/Utils.js");
const {PrivateManager} = require("./action/moderation/PrivateManager.js");
const {PrivateStoreManager} = require("./action/everyone/PrivateStoreManager.js");

// Event imports
const {DbListener} = require("./event/DbListener.js");

// Event calls
new DbListener(config, language, client).purchased();
new DbListener(config, language, client).renewal();

// Client events
client.on(`ready`, () => {
    console.log(`[${time(Date.now())}] The client "${client.user.tag}" has been connected.`); // Check if the client has been logged.
    new Database(config, time).checkConnectionState(); // Return if the client is connected to the database.
    new Database(config, time).tableCheckCreation();
});
client.on(`message`, (message) => {
    new StaffManager(message, config, language, client).selector();
    new Utils(message, config, language, client).selector();
    new PrivateManager(message, config, language, client).selector();
    new PrivateStoreManager(message, config, language, client).selector()
});

// Login to Discord Api
client.login(config.discord.token).then().catch(console.error);
