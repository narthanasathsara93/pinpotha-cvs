import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Merit } from '../../models/merits.model';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-merit-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    DatePipe,
  ],
  templateUrl: './merit-list.component.html',
  styleUrl: './merit-list.component.scss',
})
export class MeritListComponent {
  merits: Merit[] = [];
  loading = false;
  error = '';

  types = ['abc', 'pqr', 'xyz', 'lmn'];
  selectedType = '';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    this.loading = true;
    try {
      this.merits = await this.supabase.getMerits();
    } catch (e: any) {
      this.error = e.message || 'Failed to load merits';
    } finally {
      this.loading = false;
    }
  }

  get filteredMerits() {
    if (!this.selectedType) return this.merits;
    return this.merits.filter((m) => m.type === this.selectedType);
  }
}
