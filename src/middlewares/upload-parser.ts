import type { RequestHandler } from "express";
import formidable from "formidable";
import { logger } from "../logger";

export function uploadParser(): RequestHandler {
  // this eslint ignore comment can be remove in Express5.X
  // eslint-disable-next-line
  return async (req, _res, next) => {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: parseInt(process.env["UPLOAD_MAX_FILE_SIZE"]!),
      filter: ({ originalFilename, mimetype }) => {
        if (mimetype !== null && mimetype.includes("image")) return true;

        logger.warn({
          msg: `Invalid file received: ${originalFilename}, its mimetype is: ${mimetype}`,
        });

        // block the invalid file be uploaded to server
        return false;
      },
    });

    // we can remove try...catch... clause at Express5.X
    // since it can automatically catch error occured in async middleware function
    try {
      const [fields, files] = await form.parse(req);

      for (const [formName, fieldValue] of Object.entries(fields)) {
        req.body[formName] = fieldValue;
      }

      for (const [formName, fileValue] of Object.entries(files)) {
        req.body[formName] = fileValue;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
