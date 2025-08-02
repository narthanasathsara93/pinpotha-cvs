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

import { Router } from '@angular/router';
import { Merit } from '../../models/merits.model';

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
  ],
  templateUrl: './merit-form.component.html',
  styleUrl: './merit-form.component.scss',
})
export class MeritFormComponent {
  loading = false;
  merit: Partial<Merit> = {
    title: '',
    description: '',
    type: 'abc',
    image_urls: [],
    date: '', // keep as string for binding
  };
  types = [
    { label: 'Good Deed', value: 'abc' },
    { label: 'Achievement', value: 'abc' },
    { label: 'Volunteering', value: 'abc' },
    { label: 'Donation', value: 'donation' },
    { label: 'Other', value: 'other' },
  ];
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
      if (this.merit.id) {
        return;
      } else {
        // Insert new merit
        const { error } = await this.supabase.insertMerit({
          title: this.merit.title,
          description: this.merit.description,
          type: this.merit.type,
          date: this.merit.date,
          image_urls: this.merit.image_urls || [],
        });
        if (error) {
          alert('Insert failed: ' + error);
          return;
        }
      }

      this.router.navigate(['/merits']);
    } catch (err) {
      alert('An error occurred.');
    } finally {
      this.loading = false;
    }
  }

  onCancel() {
    this.router.navigate(['/merits']);
  }
}
