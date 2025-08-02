import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Merit } from '../../models/merits.model';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

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
    MatPaginatorModule,
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
  private _selectedType = '';

  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 20, 30, 40, 50, 100];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    console.log('MeritListComponent loaded');
    this.loading = true;
    try {
      this.merits = await this.supabase.getMerits();
    } catch (e: any) {
      this.error = e.message || 'Failed to load merits';
    } finally {
      this.loading = false;
    }
  }

  get selectedType() {
    return this._selectedType;
  }
  set selectedType(value: string) {
    this._selectedType = value;
    this.pageIndex = 0;
  }

  get filteredMerits(): Merit[] {
    return this.selectedType
      ? this.merits.filter((m) => m.type === this.selectedType)
      : this.merits;
  }

  get pagedMerits(): Merit[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredMerits.slice(start, start + this.pageSize);
  }

  get totalFilteredCount(): number {
    return this.filteredMerits.length;
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  onTypeChange() {
    this.pageIndex = 0;
  }

  applyFilters() {
    this.pageIndex = 0;
  }
}
