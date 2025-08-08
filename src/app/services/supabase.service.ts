import { Injectable } from '@angular/core';
import { Merit } from '../models/merits.model';
import { supabase, bucketName, mertisTable } from '../util/supabase-client';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  async getMerits(): Promise<Merit[]> {
    const cached = localStorage.getItem('meritsCache');
    if (cached) {
      return JSON.parse(cached) as Merit[];
    }
    const { data, error } = await supabase
      .from(mertisTable)
      .select('*')
      .order('date', { ascending: false });
    if (error || !data) throw new Error('Failed to fetch merits');
    localStorage.setItem('meritsCache', JSON.stringify(data));
    return data;
  }

  async getMeritById(id: number): Promise<Merit> {
    const { data, error } = await supabase
      .from(mertisTable)
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
    const { error } = await supabase.from(mertisTable).insert([merit]);
    if (error) {
      return { error: error.message };
    }
    this.clearCache();
    return {};
  }

  async updateMerit(
    id: number,
    merit: Omit<Merit, 'created_at' | 'updated_at'>
  ): Promise<void> {
    try {
      const { error: fetchError } = await supabase
        .from(mertisTable)
        .select('image_urls')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const newUrls: string[] = [];
      for (const img of merit.image_urls || []) {
        if (
          typeof img === 'object' &&
          img !== null &&
          'name' in img &&
          'size' in img &&
          'type' in img
        ) {
          const uploadedUrl = await this.uploadImage(img as File);
          if (uploadedUrl) newUrls.push(uploadedUrl);
        } else {
          newUrls.push(img);
        }
      }

      const { error: updateError } = await supabase
        .from(mertisTable)
        .update({
          ...merit,
          image_urls: newUrls,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      this.clearCache();
    } catch (err) {
      console.error('Error updating merit:', err);
      throw err;
    }
  }

  async deleteMerit(id: number): Promise<any> {
    const { error } = await supabase.from(mertisTable).delete().eq('id', id);
    if (error) throw new Error('Failed to delete merit: ' + error.message);
    this.clearCache();
  }

  async uploadImage(file: File): Promise<string | null> {
    const filePath = `${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Image upload error:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  async deleteImageFromStorage(path: string): Promise<any> {
    const { error } = await supabase.storage.from(bucketName).remove([path]);

    if (error) {
      console.error('Delete failed:', error.message);
      throw error;
    }
  }

  clearCache() {
    localStorage.removeItem('meritsCache');
  }
}
