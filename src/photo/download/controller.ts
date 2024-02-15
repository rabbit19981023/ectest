import type { Request, Response, NextFunction } from "express";
import {
  Inject,
  Controller,
  Get,
  RequireLogin,
  Validate,
  isInt,
  Logger,
  StatusCode,
  StatusPhrase,
} from "../../core";
import { AlbumService } from "../../album";
import { PhotoService } from "../service";
import { DownloadService } from "./service";

@Controller("/download/albums/:albumId/photos")
export class DownloadController {
  @Inject(Logger) private readonly logger!: Logger;
  @Inject(AlbumService) private readonly albumService!: AlbumService;
  @Inject(PhotoService) private readonly photoService!: PhotoService;
  @Inject(DownloadService) private readonly service!: DownloadService;

  @Get("/")
  @RequireLogin()
  @Validate({ params: { albumId: isInt } })
  public async downloadAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user!.id;
    const albumId = parseInt(req.params["albumId"]!);
    const album = await this.albumService.find(albumId);

    if (album === null) {
      res.status(StatusCode.NotFound).json({ status: StatusPhrase.NotFound });
      return;
    }

    if (album.userId !== userId) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    const archive = this.service.zipPhotos(userId, albumId);

    archive
      .on("warning", (warns) => {
        this.logger.warn({ warns });
      })
      .on("error", (error) => {
        next(error);
      })
      .on("close", () => {
        res.status(StatusCode.Ok).json({ status: StatusPhrase.Ok });
      })
      .pipe(res.attachment("photos.zip"));

    await archive.finalize();
  }

  @Get("/:id")
  @RequireLogin()
  @Validate({ params: { albumId: isInt, id: isInt } })
  public async download(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const albumId = parseInt(req.params["albumId"]!);
    const photoId = parseInt(req.params["id"]!);
    const photo = await this.photoService.find(albumId, photoId);

    if (photo === null) {
      res.status(StatusCode.NotFound).json({ status: StatusPhrase.NotFound });
      return;
    }

    if (photo.album.userId !== req.user!.id) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    res.download(photo.path, (error) => {
      next(error);
    });
  }
}
