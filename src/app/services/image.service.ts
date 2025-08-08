import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class ImageService {
  async compressImage(
    file: File,
    maxSizeKB = 500,
    maxWidth = 1024,
    maxHeight = 1024
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;

        function tryCompress() {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }

              if (blob.size / 1024 <= maxSizeKB || quality < 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        }

        tryCompress();
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };

      img.src = url;
    });
  }

  getDefaultImageUrl(): string {
    return 'https://exhpdkktrnbduubqjyso.supabase.co/storage/v1/object/public/merit-images/lotus_icon.jpg';
  }
}
