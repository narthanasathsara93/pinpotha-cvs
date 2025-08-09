import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-merit-detail',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    ImageGalleryComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './merit-detail.component.html',
  styleUrl: './merit-detail.component.scss',
})
export class MeritDetailComponent {
  videoUrl: SafeResourceUrl;
  merit: any = {
    image_urls: [],
  };
  loading = true;
  error = '';
  selectedImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://drive.google.com/file/d/1l8dd7JkA8apmpLqUuQfQ4B4TZ53TioXL/preview`
    );
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const result = await this.supabase.getMeritById(Number(id));
      if (result) {
        this.merit = result;
      } else {
        this.router.navigate(['/merits']);
      }
      this.loading = false;
    } else {
      this.router.navigate(['/merits']);
    }
  }
  prevImage() {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    }
  }

  nextImage() {
    if (this.selectedImageIndex < this.merit.image_urls.length - 1) {
      this.selectedImageIndex++;
    }
  }

  onBack() {
    this.router.navigate(['/merits']);
  }

  onEdit() {
    this.router.navigate([`/merits/${this.getMeritId()}/edit`]);
  }

  async onDelete() {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await this.supabase.deleteMerit(this.getMeritId());
      for (const url of this.merit.image_urls) {
        await this.deleteImageFromStorage(url);
      }
      this.openSnackBar('Merit deleted successfully');
      this.router.navigate(['/merits']);
    } catch (err: any) {
      this.openSnackBar('Failed to delete merit: ' + err.message);
    }
  }

  async deleteImageFromStorage(fullUrl: string): Promise<void> {
    try {
      await this.supabase.deleteImageFromStorage(fullUrl);
    } catch (err) {
      console.error('Error deleting image from storage:', err);
    }
  }

  getMeritId() {
    return this.merit.id ? this.merit.id : '';
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
    });
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('auth') === 'true';
  }
}
