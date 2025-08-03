import { Injectable } from '@angular/core';
import { Merit } from '../models/merits.model';
import { supabase, bucketName } from '../util/supabase-client';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  async getMerits(): Promise<Merit[]> {
    const cached = localStorage.getItem('meritsCache');
    if (cached) {
      console.log('Using cached merits data');
      return JSON.parse(cached) as Merit[];
    }
    const { data, error } = await supabase
      .from('merits')
      .select('*')
      .order('date', { ascending: false });
    if (error || !data) throw new Error('Failed to fetch merits');
    localStorage.setItem('meritsCache', JSON.stringify(data));
    return data;
  }

  async getMeritById(id: number): Promise<Merit> {
    const { data, error } = await supabase
      .from('merits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error('Failed to fetch merit data.');
    }
    return data;
  }

  async insertMerit(
    merit: Omit<Merit, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ error?: string }> {
    const { error } = await supabase.from('merits').insert([merit]);
    if (error) return { error: error.message };
    this.clearCache();
    return {};
  }

  async updateMerit(
    id: number,
    merit: Omit<Merit, 'created_at' | 'updated_at'>
  ): Promise<void> {
    //not done yet
    this.clearCache();
  }

  async deleteMerit(id: number): Promise<any> {
    const { error } = await supabase.from('merits').delete().eq('id', id);
    if (error) throw new Error('Failed to delete merit: ' + error.message);
    this.clearCache();
  }

  async uploadImage(file: File): Promise<string | null> {
    const filePath = `${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from('merit-images') // replace with your bucket name
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Image upload error:', error.message);
      return null;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('merit-images') // same bucket
      .getPublicUrl(filePath);

    // if (publicUrlError || !publicUrlData?.publicUrl) {
    //   console.error('Failed to get public URL:', publicUrlError?.message);
    //   return null;
    // }

    return publicUrlData.publicUrl;
  }
  clearCache() {
    localStorage.removeItem('meritsCache');
  }
}
