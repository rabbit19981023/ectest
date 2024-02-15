import type { Request, Response } from "express";
import {
  Inject,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  RequireLogin,
  Validate,
  isNotEmpty,
  isInt,
  StatusCode,
  StatusPhrase,
} from "../core";
import { AlbumService } from "./service";

@Controller("/albums")
export class AlbumController {
  @Inject(AlbumService) private readonly service!: AlbumService;

  @Get("/")
  @RequireLogin()
  public async findAll(req: Request, res: Response): Promise<void> {
    res.status(StatusCode.Ok).json({
      status: StatusPhrase.Ok,
      albums: await this.service.findAll(req.user!.id),
    });
  }

  @Get("/:id")
  @RequireLogin()
  @Validate({ params: { id: isInt } })
  public async find(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params["id"]!);
    const album = await this.service.find(id);

    if (album === null) {
      res.status(StatusCode.NotFound).json({ status: StatusPhrase.NotFound });
      return;
    }

    if (album.userId !== req.user!.id) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    res.status(StatusCode.Ok).json({ status: StatusPhrase.Ok, album });
  }

  @Post("")
  @RequireLogin()
  @Validate({ body: { title: isNotEmpty } })
  public async create(req: Request, res: Response): Promise<void> {
    const created = await this.service.create({
      title: req.body.title,
      userId: req.user!.id,
    });

    res
      .status(StatusCode.Created)
      .json({ status: StatusPhrase.Created, created: created.id });
  }

  @Put("/:id")
  @RequireLogin()
  @Validate({ params: { id: isInt }, body: { title: isNotEmpty } })
  public async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params["id"]!);
    const album = await this.service.find(id);

    if (album === null) {
      res.status(StatusCode.NotFound).json({ status: StatusPhrase.NotFound });
      return;
    }

    if (album.userId !== req.user!.id) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    const updated = await this.service.update(id, { title: req.body.title });

    res.status(StatusCode.Ok).json({
      status: StatusPhrase.Ok,
      updated: updated!.id,
    });
  }

  @Delete("/:id")
  @RequireLogin()
  @Validate({ params: { id: isInt } })
  public async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params["id"]!);
    const album = await this.service.find(id);

    if (album === null) {
      res.status(StatusCode.NotFound).json({ status: StatusPhrase.NotFound });
      return;
    }

    if (album.userId !== req.user!.id) {
      res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
      return;
    }

    const deleted = await this.service.delete(id);

    res.status(StatusCode.Ok).json({
      status: StatusPhrase.Ok,
      deleted: deleted!.id,
    });
  }
}
