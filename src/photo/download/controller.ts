import type { Request, Response, NextFunction } from "express";
import { StatusCode, StatusPhrase } from "../../enums";
import { logger } from "../../logger";
import {
  service as albumService,
  type Service as AlbumService,
} from "../../album/service";
import {
  service as photoService,
  type Service as PhotoService,
} from "../service";
import { service, type Service } from "./service";

export class Controller {
  private readonly albumService: AlbumService;
  private readonly photoService: PhotoService;
  private readonly service: Service;

  constructor(
    albumService: AlbumService,
    photoService: PhotoService,
    service: Service
  ) {
    this.albumService = albumService;
    this.photoService = photoService;
    this.service = service;
  }

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
        logger.warn({ warns });
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

export const controller = new Controller(albumService, photoService, service);
