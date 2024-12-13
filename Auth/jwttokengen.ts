import * as express from "express";
import JWT from "jsonwebtoken";
import CreateError from "http-errors";
declare global {
  namespace Express {
    interface Request {
      payload?: { userId: string; iat: number; exp: number }; // Add the `payload` property to `Request`
    }
  }
}
interface IPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const signAccesstoken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = { userId };
    const secret = process.env.ACCESS_TOKEN_SECRET || "";
    const options = {
      expiresIn: "8m",
      issuer: "google.com",
      audience: userId,
    };

    JWT.sign(payload, secret, options, (err:any, token:any) => {
      if (err) return reject(err);
      resolve(token!);
    });
  });
};

export const verifyaccesstoken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  if (!req.headers["authorization"]) return next(CreateError.Unauthorized());

  const bearerToken = req.headers["authorization"]!.split(" ")[1];

  JWT.verify(
    bearerToken,
    process.env.ACCESS_TOKEN_SECRET || "",
    (err:any, payload:any) => {
      if (err) return next(CreateError.Unauthorized());

      if (payload) {
        req.payload = payload; // Attach the payload to the request object
        next();
      } else {
        return next(CreateError.Unauthorized());
      }
    }
  );
};
