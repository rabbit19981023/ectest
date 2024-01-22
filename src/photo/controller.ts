import type { Request, Response } from "express";
import type { File } from "formidable";
import { StatusCode, StatusPhrase } from "../enums";
import {
  service as albumService,
  type Service as AlbumService,
} from "../album/service";
import { service, type Service } from "./service";

export class Controller {
  private readonly albumService: AlbumService;
  private readonly service: Service;

  constructor(albumService: AlbumService, service: Service) {
    this.albumService = albumService;
    this.service = service;
  }

  public async findAll(req: Request, res: Response): Promise<void> {
    const albumId = parseInt(req.params["albumId"]!);
    const photos = await this.service.findAll(albumId);

    if (photos.length > 0 && photos[0]!.album.userId !== req.user!.id) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    res.status(StatusCode.Ok).json({ status: StatusPhrase.Ok, photos });
  }

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

export const controller = new Controller(albumService, service);
