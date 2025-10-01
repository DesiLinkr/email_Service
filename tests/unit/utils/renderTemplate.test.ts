import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import { renderTemplate } from "../../../src/utils/renderTemplate";

jest.mock("fs");

describe("renderTemplate", () => {
  const mockTemplateSource = "<h1>Hello {{name}}</h1>";
  const mockTemplateName = "welcome";
  const mockData = { name: "Harsh" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render HTML from template with provided data", () => {
    // Mock fs.readFileSync
    (fs.readFileSync as jest.Mock).mockReturnValue(mockTemplateSource);

    const result = renderTemplate(mockTemplateName, mockData);

    // Check fs.readFileSync is called with correct path
    const expectedPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "src",
      "templates",
      `${mockTemplateName}.hbs`
    );
    expect(fs.readFileSync).toHaveBeenCalledWith(expectedPath, "utf8");

    // Verify rendered HTML output
    expect(result).toBe("<h1>Hello Harsh</h1>");
  });

  it("should throw if template file not found", () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("File not found");
    });

    expect(() => renderTemplate("invalidTemplate", mockData)).toThrow(
      "File not found"
    );
  });
});
