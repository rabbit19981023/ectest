import { and, eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import fs from "fs/promises";
import path from "path";
import { db } from "../db";
import type { File } from "../middlewares/upload-parser";
import { albums, type Album } from "../album/schema";
import { photos, PHOTO_COLUMNS, type Photo } from "./schema";

type PhotoWithAlbum = Photo & { album: Album };

export class Service {
  private readonly db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  public async findAll(albumId: number): Promise<PhotoWithAlbum[]> {
    return await this.db
      .select({
        album: albums,
        ...PHOTO_COLUMNS,
      })
      .from(photos)
      .innerJoin(albums, eq(photos.albumId, albums.id))
      .where(eq(photos.albumId, albumId));
  }

  public async find(
    albumId: number,
    photoId: number
  ): Promise<PhotoWithAlbum | null> {
    const rows = await this.db
      .select({
        album: albums,
        ...PHOTO_COLUMNS,
      })
      .from(photos)
      .innerJoin(albums, eq(photos.albumId, albums.id))
      .where(and(eq(photos.albumId, albumId), eq(photos.id, photoId)));

    return rows[0] ?? null;
  }

  public async create(
    userId: number,
    albumId: number,
    files: File[],
    descriptions: { [originFilename in string]: string }
  ): Promise<Photo[]> {
    const uploadFiles: UploadFile[] = [];
    const uploadTasks: Array<Promise<void>> = [];
    const uploadDir = `uploads/user_${userId}/album_${albumId}`;

    await fs.mkdir(uploadDir, { recursive: true });

    for (const { originalFilename, newFilename, chunks } of files) {
      const uploadPath = `${uploadDir}/${newFilename}`;
      const uploadFile: UploadFile = { path: uploadPath };
      const description = descriptions[originalFilename!];

      if (description !== undefined) uploadFile.description = description;

      uploadFiles.push(uploadFile);
      uploadTasks.push(this.pipeFile(chunks, uploadPath));
    }

    await Promise.all(uploadTasks);

    const createDto: CreateDTO[] = uploadFiles.map((file) => ({
      albumId,
      ...file,
    }));
    const rows = await this.db.insert(photos).values(createDto).returning();
    return rows;
  }

  public async update(
    originAlbumId: number,
    photoId: number,
    photoPath: string,
    updateData: {
      uploadFile?: File;
      description?: string;
    }
  ): Promise<Photo | null> {
    const updateDto: UpdateDTO = {};
    const { uploadFile, description } = updateData;

    // update the photo file
    if (uploadFile !== undefined) {
      const { newFilename, chunks } = uploadFile;
      const photoDir = path.dirname(photoPath);
      const newPath = `${photoDir}/${newFilename}`;

      await this.pipeFile(chunks, newPath);
      await fs.unlink(photoPath);

      updateDto.path = newPath;
    }

    // update the photo description
    if (description !== undefined) {
      updateDto.description = description;
    }

    const rows = await this.db
      .update(photos)
      .set({ ...updateDto, updatedAt: new Date() })
      .where(and(eq(photos.albumId, originAlbumId), eq(photos.id, photoId)))
      .returning();

    return rows[0] ?? null;
  }

  public async delete(
    albumId: number,
    photoId: number,
    photoPath: string
  ): Promise<Photo | null> {
    const rows = await this.db
      .delete(photos)
      .where(and(eq(photos.albumId, albumId), eq(photos.id, photoId)))
      .returning();

    await fs.unlink(photoPath);

    return rows[0] ?? null;
  }

  private async pipeFile(chunks: Buffer[], path: string): Promise<void> {
    const file = await fs.open(path, "w");

    for await (const chunk of chunks) {
      await file.write(chunk);
    }

    await file.close();
  }
}

type CreateDTO = {
  path: string;
  description?: string;
  albumId: number;
};

type UpdateDTO = {
  path?: string;
  description?: string;
  albumId?: number;
};

type UploadFile = {
  path: string;
  description?: string;
};

export const service = new Service(db);
