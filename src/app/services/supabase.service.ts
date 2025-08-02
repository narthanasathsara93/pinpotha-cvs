import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Merit } from '../models/merits.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient<Merit>;

  constructor() {
    this.supabase = createClient(
      'https://exhpdkktrnbduubqjyso.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4aHBka2t0cm5iZHV1YnFqeXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTY3OTksImV4cCI6MjA2OTI5Mjc5OX0.dUhVXQZMMaVL8EDZjtRBt8RT8iy9NKlKEWx8VDVDEZU'
      //passowrd HE5E53WxVoHjVjwD
    );
  }

  async getMerits(): Promise<Merit[]> {
    const { data, error } = await this.supabase
      .from('merits')
      .select('*')
      .order('date', { ascending: false });

    console.log('Merits fetched:', data, error);
    if (error) {
      console.error('Error fetching merits:', error);
      throw new Error(error.message);
    }
    return data || [];
  }
}
