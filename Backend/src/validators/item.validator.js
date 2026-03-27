import { body } from "express-validator";

export const saveItemValidator = [
    body("url")
        .trim()
        .notEmpty()
        .withMessage("URL is required")
        .isURL()
        .withMessage("Please provide a valid URL"),

    body("title")
        .optional()
        .trim(),
];
