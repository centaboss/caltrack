import { Injectable, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class CameraService {
  private readonly sanitizer = inject(DomSanitizer);

  async captureMealPhoto(): Promise<string | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Camera.checkPermissions();
        if (permissions.camera !== 'granted') {
          const req = await Camera.requestPermissions({ permissions: ['camera'] });
          if (req.camera !== 'granted') {
            throw new Error('Camera permission not granted');
          }
        }
      }

      const photo = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1024,
        correctOrientation: true,
        saveToGallery: false,
      });

      if (!photo.dataUrl) {
        return photo.webPath ?? null;
      }

      if (Capacitor.getPlatform() === 'web') {
        return photo.dataUrl;
      }

      const base64 = photo.dataUrl.includes(',') ? photo.dataUrl.split(',')[1] : photo.dataUrl;
      if (!base64) {
        return photo.webPath ?? photo.dataUrl;
      }

      const filename = `meal-${Date.now()}.jpeg`;
      const saved = await Filesystem.writeFile({
        path: `meals/${filename}`,
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

  displayUrl(photo: string | null | undefined): SafeUrl | string | null {
    if (!photo) return null;
    if (photo.startsWith('data:') || photo.startsWith('blob:')) {
      return photo;
    }
    const url = photo.startsWith('http://') || photo.startsWith('https://') ? photo : Capacitor.convertFileSrc(photo);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  isCancelled(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /cancel/i.test(message) || /user cancelled/i.test(message);
  }
}

