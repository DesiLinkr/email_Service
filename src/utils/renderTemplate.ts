import handlebars from "handlebars";
import fs from "fs";
import path from "path";
export const renderTemplate = (templateName: string, data: object) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    `${templateName}.hbs`
  );
  const templateSource = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(templateSource);

  const html = template(data);

  return html;
};
