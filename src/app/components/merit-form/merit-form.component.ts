import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
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
import { types } from '../../util/options'; // Assuming you have a types array defined in options.ts
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
    MatIconModule
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
    date: '', // keep as string for binding
  };
  types = types; // Assuming you have a types array defined in options.ts
  previewUrl: string | null = null;
  filePreviews: string[] = [];
  imageUrl: string | null = null;
  imageUrls: string[] = [];
  selectedFiles: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // edit mode
      this.loading = true;
      try {
        this.merit = await this.supabase.getMeritById(+id);
      } catch (e) {
        // handle error
      } finally {
        this.loading = false;
      }
    } else {
      // new mode, initialize empty merit
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
      // 🔹 Upload images first
      const imageUrls = await this.uploadSelectedImages();

      // 🔹 Set the image_urls array in the merit object
      this.merit.image_urls = imageUrls;

      if (this.merit.id) {
        return; // handle update logic here if needed
      } else {
        // 🔹 Insert new merit
        const { error } = await this.supabase.insertMerit({
          title: this.merit.title,
          description: this.merit.description,
          type: this.merit.type,
          date: this.merit.date,
          image_urls: imageUrls,
        });

        if (error) {
          alert('Insert failed: ' + error);
          return;
        }
      }

      this.router.navigate(['/merits']);
    } catch (err) {
      alert('An error occurred during submission.');
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async uploadSelectedImages(): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of this.selectedFiles) {
      const url = await this.supabase.uploadImage(file);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    return uploadedUrls;
  }

  onCancel() {
    this.router.navigate(['/merits']);
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

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.filePreviews.splice(index, 1);
  }
}
