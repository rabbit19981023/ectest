import type { RequestHandler } from "express";
import { Duplex } from "stream";
import formidable from "formidable";
import { INJECTIONS, Logger } from "../core";

export type File = {
  originalFilename: string | null;
  newFilename: string;
  mimetype: string | null;
  chunks: Buffer[];
};

export function uploadParser(): RequestHandler {
  const logger = INJECTIONS.get(Logger) as Logger;

  // this eslint ignore comment can be remove in Express5.X
  // eslint-disable-next-line
  return async (req, _res, next) => {
    const buffers = new Map<string, Buffer[]>();
    const form = formidable({
      keepExtensions: true,
      maxFileSize: parseInt(process.env["UPLOAD_MAX_FILE_SIZE"]!),

      filter: ({ originalFilename, mimetype }) => {
        if (mimetype !== null && mimetype.includes("image")) return true;

        logger.warn({
          msg: `Invalid file received: ${originalFilename}, its mimetype is: ${mimetype}`,
        });

        // block the invalid file be uploaded
        return false;
      },

      fileWriteStreamHandler: (file: any): Duplex => {
        const chunks: Buffer[] = [];
        return new Duplex({
          read: () => {},

          write: (chunk: Buffer, _encoding, next) => {
            chunks.push(chunk);
            next();
          },

          final: (next) => {
            buffers.set((file?.newFilename as string | null) ?? "", chunks);
            next();
          },

          destroy: (_error, next) => {
            buffers.clear();
            next();
          },
        });
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
        req.body[formName] =
          fileValue?.map((file) => {
            const { originalFilename, newFilename, mimetype } = file;
            return {
              originalFilename,
              newFilename,
              mimetype,
              chunks: buffers.get(file.newFilename) ?? [],
            } satisfies File;
          }) ?? [];
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
