import type { Request, Response } from "express";
import {
  Inject,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Use,
  RequireLogin,
  Validate,
  isInt,
  isJson,
  StatusCode,
  StatusPhrase,
} from "../core";
import { AlbumService } from "../album";
import { PhotoService } from "./service";
import { uploadParser, type File } from "./upload-parser";

@Controller("/albums/:albumId/photos")
export class PhotoController {
  @Inject(AlbumService) private readonly albumService!: AlbumService;
  @Inject(PhotoService) private readonly service!: PhotoService;

  @Get("/")
  @RequireLogin()
  @Validate({ params: { albumId: isInt } })
  public async findAll(req: Request, res: Response): Promise<void> {
    const albumId = parseInt(req.params["albumId"]!);
    const photos = await this.service.findAll(albumId);

    if (photos.length > 0 && photos[0]!.album.userId !== req.user!.id) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    res.status(StatusCode.Ok).json({ status: StatusPhrase.Ok, photos });
  }

  @Get("/:id")
  @RequireLogin()
  @Validate({ params: { albumId: isInt, id: isInt } })
  public async find(req: Request, res: Response): Promise<void> {
    const albumId = parseInt(req.params["albumId"]!);
    const photoId = parseInt(req.params["id"]!);
    const photo = await this.service.find(albumId, photoId);

    if (photo === null) {
      res.status(StatusCode.NotFound).json({ status: StatusPhrase.NotFound });
      return;
    }

    if (photo.album.userId !== req.user!.id) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    res.status(StatusCode.Ok).json({ status: StatusPhrase.Ok, photo });
  }

  @Post("/")
  @RequireLogin()
  @Validate({ params: { albumId: isInt } })
  @Use(uploadParser())
  @Validate({
    body: {
      files: (files?: File[]) => {
        return (
          files !== undefined &&
          files.every((file) => file.chunks !== undefined)
        );
      },
      descriptions: (descriptions?: string[]) => {
        return (
          descriptions === undefined ||
          (descriptions.length === 1 && isJson(descriptions[0]))
        );
      },
    },
  })
  public async create(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const albumId = parseInt(req.params["albumId"]!);
    const album = await this.albumService.find(albumId);

    if (album === null) {
      res.status(StatusCode.NotFound).json({ status: "album is not found!" });
      return;
    }

    if (album.userId !== userId) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    const { files } = req.body;
    const descriptions: string =
      req.body.descriptions === undefined ? "{}" : req.body.descriptions[0];

    const created = await this.service.create(
      userId,
      albumId,
      files as File[],
      JSON.parse(descriptions) as { [originFilename in string]: string }
    );

    res.status(StatusCode.Created).json({
      status: StatusPhrase.Created,
      created: created.map(({ id }) => id),
    });
  }

  @Put("/:id")
  @RequireLogin()
  @Validate({ params: { albumId: isInt, id: isInt } })
  @Use(uploadParser())
  @Validate({
    body: {
      file: (file?: File[]) => {
        return (
          file === undefined ||
          (file.length === 1 && file[0]?.chunks !== undefined)
        );
      },
      description: (description?: string[]) => {
        return (
          description === undefined ||
          (description.length === 1 && !isJson(description[0]))
        );
      },
    },
  })
  public async update(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const albumId = parseInt(req.params["albumId"]!);
    const photoId = parseInt(req.params["id"]!);
    const photo = await this.service.find(albumId, photoId);

    if (photo === null) {
      res.status(StatusCode.NotFound).json({ status: StatusPhrase.NotFound });
      return;
    }

    if (photo.album.userId !== userId) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    const { file, description } = req.body;
    const updated = await this.service.update(albumId, photoId, photo.path, {
      uploadFile: file?.[0],
      description: description?.[0],
    });

    res
      .status(StatusCode.Ok)
      .json({ status: StatusPhrase.Ok, updated: updated!.id });
  }

  @Delete("/:id")
  @RequireLogin()
  @Validate({ params: { albumId: isInt, id: isInt } })
  public async delete(req: Request, res: Response): Promise<void> {
    const albumId = parseInt(req.params["albumId"]!);
    const photoId = parseInt(req.params["id"]!);
    const photo = await this.service.find(albumId, photoId);

    if (photo === null) {
      res.status(StatusCode.NotFound).json({ status: StatusPhrase.NotFound });
      return;
    }

    if (photo.album.userId !== req.user!.id) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    const deleted = await this.service.delete(albumId, photoId, photo.path);

    res
      .status(StatusCode.Ok)
      .json({ status: StatusPhrase.Ok, deleted: deleted!.id });
  }
}
