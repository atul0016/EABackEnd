import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
var morgan = require('morgan')
import authRoute from './Auth/auth'; 

dotenv.config(); 

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

const dbUrl: string = process.env.URL || '';
mongoose.connect(dbUrl)
  .then(() => {
    console.log("Connected to database");
    app.listen(process.env.PORT, () => {
      console.log(`Listening at port ${process.env.PORT}`);
    });
  })
  .catch((error: Error) => {
    console.log(error.message);
  });

app.use('/auth', authRoute);

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello World");
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError("Not Found", 404);
  next(error);
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  res.send({
    error: {
      message: err.message,
      status: err.status
    }
  });
});
