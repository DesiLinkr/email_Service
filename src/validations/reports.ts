import Joi from "joi";

export class ReportsValidation {
  private static Report = Joi.object({
    data: Joi.object({
      to: Joi.string().email().required(),
      subject: Joi.string().min(1).required(),
      month: Joi.string().required(),
      totalClicks: Joi.number().integer().min(0).required(),
      totalQrScans: Joi.number().integer().min(0).required(),
      newLinks: Joi.number().integer().min(0).required(),

      topLinks: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().required(),
            url: Joi.string().uri().required(),
            shortUrl: Joi.string().uri().required(),
            clicks: Joi.number().integer().min(0).required(),
            createdOn: Joi.date().required(),
          })
        )
        .required(),

      topQRCodes: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            url: Joi.string().uri().required(),
            shortUrl: Joi.string().uri().required(),
            scans: Joi.number().integer().min(0).required(),
            createdOn: Joi.date().required(),
          })
        )
        .required(),

      countries: Joi.array()
        .items(
          Joi.object({
            rank: Joi.number().integer().min(1).required(),
            flag: Joi.string().required(), // could be emoji or image URL
            name: Joi.string().required(),
            clicks: Joi.number().integer().min(0).required(),
            qrScans: Joi.number().integer().min(0).required(),
          })
        )
        .required(),

      otherCountries: Joi.object({
        clicks: Joi.number().integer().min(0).required(),
        qrScans: Joi.number().integer().min(0).required(),
      }).required(),

      year: Joi.number().integer().required(),
    }).required(),

    createdAt: Joi.date().required(),
    retry: Joi.number().integer().min(0).required(),
  });

  static Reports = Joi.array().items(ReportsValidation.Report).required();
}
