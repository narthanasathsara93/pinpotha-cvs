import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Merit } from '../../models/merits.model';

@Component({
  selector: 'app-merit-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merit-list.component.html',
  styleUrl: './merit-list.component.scss',
})
export class MeritListComponent {
  tasks: Merit[] = [];
  error = '';

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  async loadTasks() {
    try {
      this.tasks = await this.supabaseService.getMerits();
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }
}
