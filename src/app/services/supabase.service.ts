import { Injectable } from '@angular/core';
import { Merit } from '../models/merits.model';
import { supabase } from '../util/supabase-client';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  
  async getMerits(): Promise<Merit[]> {
    const { data, error } = await supabase
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
