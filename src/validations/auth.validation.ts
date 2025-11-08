import Joi from "joi";

export class AuthEmailValidation {
  static VerificationEmail = Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().default(
      "Welcome! Please confirm your email to get started"
    ),
    data: Joi.object({
      name: Joi.string().required(),
      verifyUrl: Joi.string().uri().required(),
      expiry: Joi.number().required(),
      year: Joi.string(),
      context: Joi.string().valid("registration", "secondary").required(),
    }).required(),
    retry: Joi.number().default(0),
  });

  static AccessEmail = Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().default("We noticed a new sign-in to your account"),
    data: Joi.object({
      name: Joi.string().required(),
      location: Joi.string().required(),
      ipAddress: Joi.string().required(),
      dateTime: Joi.string().required(),
      secureAccountUrl: Joi.string().required(),
      year: Joi.string(),
    }).required(),
    retry: Joi.number().default(0),
  });
  static forgotPassword = Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().default("Password reset request for your account"),
    data: Joi.object({
      name: Joi.string().required(),
      resetLink: Joi.string().required(),
      year: Joi.string(),
      expiry: Joi.number().required(),
    }),

    retry: Joi.number().default(0),
  });
}
