import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
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
  merit: any = {
    image_urls: [],
  };
  loading = true;
  error = '';
  selectedImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private supabase: SupabaseService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const result = await this.supabase.getMeritById(Number(id));
      if (result) {
        this.merit = result;
      } else {
        this.error = 'Failed to load merit';
      }
      this.loading = false;
    }
  }
  isLoggedIn(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    return isLoggedIn;
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
      this.openSnackBar('Merit deleted successfully');
      this.router.navigate(['/merits']);
    } catch (err: any) {
      this.openSnackBar('Failed to delete merit: ' + err.message);
    }
  }

  getMeritId() {
    return this.merit.id ? this.merit.id : '';
  }
  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 100000,
    });
  }
}
