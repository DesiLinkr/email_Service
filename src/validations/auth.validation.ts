import Joi from "joi";

export class AuthEmailValidation {
  static VerificationEmail = Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().required(),
    data: Joi.object({
      name: Joi.string().required(),
      verifyUrl: Joi.string().uri().required(),
      expiry: Joi.number().required(),
      year: Joi.string(),
    }).required(),
    retry: Joi.number().default(0),
  });

  static AccessEmail = Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().required(),
    data: Joi.object({
      name: Joi.string().required(),
      location: Joi.string().required(),
      ipAddress: Joi.string().required(),
      dateTime: Joi.date().required(),
      secureAccountUrl: Joi.string().required(),
      year: Joi.string(),
    }).required(),
    retry: Joi.number().default(0),
  });
}
