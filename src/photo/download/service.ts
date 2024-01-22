import archiver from "archiver";

export class Service {
  public zipPhotos(userId: number, albumId: number): archiver.Archiver {
    const archive = archiver("zip");
    archive.directory(`uploads/user_${userId}/album_${albumId}`, "photos");
    return archive;
  }
}

export const service = new Service();
