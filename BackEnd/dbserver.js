const express = require("express")
const app = express()
require("dotenv").config()

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const mysql = require("mysql")

const db = mysql.createPool({
    connectionLimit: 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT,
    multipleStatements: true
})
db.getConnection((err, connection)=> {
    if(err) throw (err)
    console.log("DB connectect sucefull : " + connection.threadId)
})