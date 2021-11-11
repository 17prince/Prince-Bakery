const dotenv = require('dotenv');

const mongoose = require('mongoose');

// CATCH UNCAUGTH EXPRESSION
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception, Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(/<PASSWORD>/, process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Database Connected');
  });

const port = process.env.PORT || 1714;
const app = require('./app');

const server = app.listen(port, () => {
  console.log('Server Started at port 1714');
});

// UNHANDLE RECJECTION
process.on('unhandledRejection', (err) => {
  console.log('Unhandle Rejection, Shutting down.....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
