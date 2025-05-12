// mongo db connecting
const mongoose = require('mongoose')

const dbConnect = () => {
    //const db_url = process.env.DB_URI
    const db_url = process.env.NODE_ENV === 'test' ? process.env.DB_URI_TEST : process.env.DB_URI
    mongoose.set('strictQuery', false)

    try{
        mongoose.connect(db_url)
    }catch(error){
        console.err("DB connection error", error)
    }

    mongoose.connection.on("connected",() => console.log("DB   connected"))
}

module.exports = dbConnect