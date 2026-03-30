import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export class SupabaseStorageClient {
  async uploadFile(bucket: string, path: string, buffer: Buffer, contentType = 'video/mp4') {
    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: true
    });

    if (error) {
      if (error.message.includes('Invalid Compact JWS')) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY invalida. Configure a Service Role key correta no .env.');
      }
      throw new Error(`Falha no upload do storage: ${error.message}`);
    }
  }

  async downloadFile(bucket: string, path: string): Promise<Buffer> {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);

    if (error || !data) {
      throw new Error(`Falha ao baixar arquivo do storage: ${error?.message ?? 'arquivo ausente'}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  getPublicUrl(bucket: string, path: string): string {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async removeFile(bucket: string, path: string) {
    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`Falha ao remover arquivo: ${error.message}`);
    }
  }
}
