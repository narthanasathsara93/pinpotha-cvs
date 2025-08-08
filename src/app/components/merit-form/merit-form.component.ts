import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ImageService } from '../../services/image.service';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { Router } from '@angular/router';
import { Merit } from '../../models/merits.model';
import { options } from '../../util/options';
export interface Option {
  label: string;
  value: string;
}
@Component({
  selector: 'app-merit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './merit-form.component.html',
  styleUrl: './merit-form.component.scss',
})
export class MeritFormComponent {
  loading = false;
  merit: Partial<Merit> = {
    title: '',
    description: '',
    type: '',
    image_urls: [],
    date: '',
  };
  types: Option[] = options;
  previewUrl: string | null = null;
  filePreviews: string[] = [];
  imageUrl: string | null = null;
  imageUrls: string[] = [];
  selectedFiles: File[] = [];
  existingImages: string[] = [];
  removedImages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService,
    private imageService: ImageService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      try {
        this.merit = await this.supabase.getMeritById(+id);
        this.existingImages = [...(this.merit.image_urls || [])];
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    } else {
      this.merit = {
        title: '',
        description: '',
        type: '',
        image_urls: [],
        date: '',
      };
    }
  }

  async onSubmit() {
    if (
      !this.merit.title ||
      !this.merit.description ||
      !this.merit.date ||
      !this.merit.type
    ) {
      alert('Please fill all required fields.');
      return;
    }

    this.loading = true;

    this.merit.date =
      typeof this.merit.date === 'string'
        ? this.merit.date
        : (this.merit.date as Date).toISOString();

    try {
      const uploadedUrls = await this.uploadSelectedImages();
      const finalImageUrls = [...this.existingImages, ...uploadedUrls].filter(
        Boolean
      );

      if (this.merit.id) {
        await this.supabase.updateMerit(parseInt(this.merit.id), {
          id: this.merit.id,
          title: this.merit.title!,
          description: this.merit.description!,
          type: this.merit.type!,
          date: this.merit.date!,
          image_urls: finalImageUrls || [],
          video_urls: this.getVideoUrl(this.merit.video_urls) || [],
        });

        for (const url of this.removedImages) {
          await this.deleteImageFromStorage(url);
        }
        this.removedImages = [];
      } else {
        await this.supabase.insertMerit({
          title: this.merit.title,
          description: this.merit.description,
          type: this.merit.type,
          date: this.merit.date,
          image_urls: finalImageUrls || [],
          video_urls: this.getVideoUrl(this.merit.video_urls) || [],
        });
      }
      this.goBackToDetailPage();
    } catch (err) {
      alert('An error occurred during submission.');
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async uploadSelectedImages(): Promise<string[]> {
    const uploadedUrls: string[] = [];

    if (this.selectedFiles.length === 0) {
      return uploadedUrls;
    }

    for (const file of this.selectedFiles) {
      const compressedFile = await this.imageService.compressImage(file, 300);
      const url = await this.supabase.uploadImage(compressedFile);
      if (url) {
        uploadedUrls.push(url);
      }
    }
    return uploadedUrls;
  }

  onCancel() {
    this.goBackToDetailPage();
  }

  goBackToDetailPage() {
    this.router.navigate([`/merits/${this.merit.id ? this.merit.id : ''}`]);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach((file) => {
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.filePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  async deleteImageFromStorage(fullUrl: string): Promise<void> {
    try {
      const { error } = await this.supabase.deleteImageFromStorage(fullUrl);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting image from storage:', err);
    }
  }

  removeExistingImageLocally(index: number) {
    const confirmDelete = confirm(
      'Remove this image? It will be deleted from storage after saving.'
    );
    if (!confirmDelete) return;

    const removed = this.existingImages.splice(index, 1)[0];
    this.removedImages.push(removed);
  }

  removeNewImageLocally(index: number) {
    this.selectedFiles.splice(index, 1);
    this.filePreviews.splice(index, 1);
  }

  getVideoUrl(vidUrls: any): string[] {
    if (!vidUrls) return [];
    return vidUrls.split(',').map((s: string) => s.trim());
  }
}
