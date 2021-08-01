const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_DB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })
    console.log('connected to database')
  } catch (err) {
    console.log(`Error:  ${err.message}`);
    //// exit the process
    process.exit(1);
  }
};


module.exports = connectDb;