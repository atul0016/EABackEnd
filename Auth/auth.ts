import express, { Request, Response, NextFunction } from 'express';
import CreateError from 'http-errors';
import { authschema, loginschema } from './joivalidation';
import { signAccesstoken, verifyaccesstoken } from './jwttokengen';
import Users, { IUser } from '../SchmaModels/schmdls';

const router = express.Router();

// Register route
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authschema.validateAsync(req.body);
        
        const doexist = await Users.findOne({ email: result.email });
        if (doexist) throw CreateError.Conflict("Email already exists");
        
        if (result.password !== result.cpassword) throw CreateError.Conflict("Passwords are not matching");
        
        const user = new Users(result);
        const savedUser = await user.save();
        const accessToken = await signAccesstoken(savedUser.id);
        
        res.send({ accessToken });
    } catch (error) {
        res.send(error);
        next(error);
    }
});

// Get user by ID
router.post('/userid', async (req: Request, res: Response, next: NextFunction) => {

    try {
        const result = await Users.findById(req.body.id);
        console.log(result);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

// Login route
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    console.log("the body&^&^U%^&",req.body);
    
    try {
        const result = await loginschema.validateAsync(req.body);
        
        const user = await Users.findOne({ email: result.email });
        console.log("this is login user",user);
        if (!user) throw CreateError.Conflict("Email or password is wrong");

        const doMatch = await user.isValidPassword(result.password);
        if (!doMatch) throw CreateError.Conflict("ID or password is wrong");

        const accessToken = await signAccesstoken(user.id);
        console.log("access token",accessToken);
        res.send({ accessToken });
    } catch (error:any) {
        res.send(error);
        next(error);
    }
});

export default router;
