import Joi from '@hapi/joi';

export const authschema = Joi.object({
    name: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(4).required(),
    cpassword: Joi.string().min(4).required(),
});

export const loginschema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(4).required(),
});
