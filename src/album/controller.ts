import type { Request, Response } from "express";
import { StatusCode, StatusPhrase } from "../enums";
import { service, type Service } from "./service";

export class Controller {
  private readonly service: Service;

  constructor(service: Service) {
    this.service = service;
  }

  public async findAll(req: Request, res: Response): Promise<void> {
    res.status(StatusCode.Ok).json({
      status: StatusPhrase.Ok,
      albums: await this.service.findAll(req.user!.id),
    });
  }

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

  public async create(req: Request, res: Response): Promise<void> {
    const created = await this.service.create({
      title: req.body.title,
      userId: req.user!.id,
    });

    res
      .status(StatusCode.Created)
      .json({ status: StatusPhrase.Created, created: created.id });
  }

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

export const controller = new Controller(service);
