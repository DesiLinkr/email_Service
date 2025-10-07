import Joi from "joi";

export const validate = (
  schema: Joi.ObjectSchema | Joi.ArraySchema,
  data: any
) => {
  const { error, value } = schema.validate(data);

  if (error) {
    throw new Error(
      `Validation error: ${error.details.map((d) => d.message).join(", ")}`
    );
  }
  return value;
};
