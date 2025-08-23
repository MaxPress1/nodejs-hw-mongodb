import Joi from "joi";
import { isValidObjectId } from "mongoose";

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be less than 20 characters long",
    "any.required": "Name is required",
  }),
  email: Joi.string().min(3).max(20).email().messages({
    "string.email": "Invalid email address",
  }),
  phoneNumber: Joi.string().min(3).max(20).required().messages({
    "string.min": "Phone must be at least 3 characters long",
    "string.max": "Phone must be less than 20 characters long",
    "any.required": "Phone is required",
  }),
  isFavourite: Joi.boolean().default(false),
  contactType: Joi.string().valid("personal", "work", "home").required().messages({
    "any.required": "Contact type is required",
  }),
  userId: Joi.string().custom((value, helper) => {
		    if (value && !isValidObjectId(value)) {
		      return helper.message('User id should be a valid mongo id');
		    }
		    return true;
		 }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be less than 20 characters long",
  }),
  email: Joi.string().min(3).max(20).email().messages({
    "string.email": "Invalid email address",
  }),
  phoneNumber: Joi.string().min(3).max(20).messages({
    "string.min": "Phone must be at least 3 characters long",
    "string.max": "Phone must be less than 20 characters long",
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid("personal", "work", "home"),
});
