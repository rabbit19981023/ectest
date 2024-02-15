import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Inject, Injectable, DrizzleOrm, aggregateOne2Many } from "../core";
import { photos, type Photo } from "../photo";
import { albums, type Album } from "./schema";

type AlbumWithPhotos = Album & { photos: Photo[] };

@Injectable()
export class AlbumService {
  @Inject(DrizzleOrm) private readonly db!: PostgresJsDatabase;

  public async findAll(userId: number): Promise<AlbumWithPhotos[]> {
    const rows = await this.db
      .select({
        album: albums,
        photos,
      })
      .from(albums)
      .leftJoin(photos, eq(albums.id, photos.albumId))
      .where(eq(albums.userId, userId));

    return aggregateOne2Many(rows, "album", "photos");
  }

  public async find(id: number): Promise<AlbumWithPhotos | null> {
    const rows = await this.db
      .select({
        album: albums,
        photos,
      })
      .from(albums)
      .leftJoin(photos, eq(albums.id, photos.albumId))
      .where(eq(albums.id, id));

    return aggregateOne2Many(rows, "album", "photos")[0] ?? null;
  }

  public async create(createDTO: CreateDTO): Promise<Album> {
    const rows = await this.db.insert(albums).values(createDTO).returning();
    return rows[0]!;
  }

  public async update(
    id: number,
    replacement: UpdateDTO
  ): Promise<Album | null> {
    const rows = await this.db
      .update(albums)
      .set({ ...replacement, updatedAt: new Date() })
      .where(eq(albums.id, id))
      .returning();

    return rows[0] ?? null;
  }

  public async delete(id: number): Promise<Album | null> {
    const rows = await this.db
      .delete(albums)
      .where(eq(albums.id, id))
      .returning();

    return rows[0] ?? null;
  }
}

type CreateDTO = {
  title: string;
  userId: number;
};

type UpdateDTO = {
  title: string;
};
