import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class CameraService {
  async captureMealPhoto(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 72,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1280,
        correctOrientation: true,
        saveToGallery: false,
      });

      if (!photo.dataUrl) {
        return photo.webPath ?? null;
      }

      if (Capacitor.getPlatform() === 'web') {
        return photo.dataUrl;
      }

      const base64 = photo.dataUrl.split(',')[1];
      const saved = await Filesystem.writeFile({
        path: `meals/meal-${Date.now()}.jpeg`,
        data: base64,
        directory: Directory.Data,
        recursive: true,
      });

      return saved.uri;
    } catch (error) {
      if (this.isCancelled(error)) {
        return null;
      }
      throw error;
    }
  }

  displayUrl(photo: string | null | undefined): string | null {
    if (!photo) return null;
    if (photo.startsWith('data:') || photo.startsWith('blob:') || photo.startsWith('http')) {
      return photo;
    }
    return Capacitor.convertFileSrc(photo);
  }

  isCancelled(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /cancel/i.test(message);
  }
}
