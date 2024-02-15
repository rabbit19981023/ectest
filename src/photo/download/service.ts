import archiver from "archiver";
import { Injectable } from "../../core";

@Injectable()
export class DownloadService {
  public zipPhotos(userId: number, albumId: number): archiver.Archiver {
    const archive = archiver("zip");
    archive.directory(`uploads/user_${userId}/album_${albumId}`, "photos");
    return archive;
  }
}
