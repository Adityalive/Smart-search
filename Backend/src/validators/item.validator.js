import { body } from "express-validator";

export const saveItemValidator = [
    body("url")
        .optional({ checkFalsy: true })
        .trim()
        .isURL()
        .withMessage("Please provide a valid URL"),

    body("title")
        .optional()
        .trim(),
        
    body("url").custom((value, { req }) => {
        if (!value && !req.file) {
            throw new Error("You must provide either a URL or upload a file.");
        }
        return true;
    }),
];
