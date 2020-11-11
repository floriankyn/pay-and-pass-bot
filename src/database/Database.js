//Database.js// -- created by Florian Lepage 09/11/2020

// mysql2 lib import
const mysql = require("mysql2");

class Database {
    constructor(token, time=null) {
        this.dbUsername = token.database.username;
        this.dbDatabase = token.database.database;
        this.dbPassword = token.database.password;
        this.dbHost = token.database.host;
        this.dbPort = token.database.port;
        this.time = time;
    }
    connection() { // connection method for mysql queries
        return mysql.createConnection({
            user: this.dbUsername,
            database: this.dbDatabase,
            password: this.dbPassword,
            host: this.dbHost,
            port: this.dbPort
        });
    }
    checkConnectionState() { // method to check if the mysql connection state is efficient
        this.connection().query(`CREATE TABLE IF NOT EXISTS connectionState (state VARCHAR(30))`, (err) => {
            if(err) {
                throw err;
            } else {
                return console.log(`[${this.time(Date.now())}] The connection between the client & the Database has been established.`);
            }
        });
    }
    tableCheckCreation() { // methode to create all the required mysql tables
        this.connection().query(`CREATE TABLE IF NOT EXISTS dc_staff_members (user_id VARCHAR(30), added_at VARCHAR(30), added_by VARCHAR(30))`, (err) => {
            if(err) throw err;
        });
        this.connection().query(`CREATE TABLE IF NOT EXISTS dc_private_channels (stripe_product_id VARCHAR(255), channel_id VARCHAR(30), guild_id VARCHAR(30), role_id VARCHAR(30), renewal_in_ms VARCHAR(255), added_at VARCHAR(30), added_by VARCHAR(30))`, (err) => {
            if(err) throw err;
        });
        this.connection().query(`CREATE TABLE IF NOT EXISTS dc_purchased_users (user_id VARCHAR(30), order_id VARCHAR(30), time VARCHAR(30), channel_id VARCHAR(30))`, (err) => {
            if(err) throw err;
        });
    }
}

module.exports = {
    Database
}
