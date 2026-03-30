import { SupabaseStorageClient } from '@/server/clients/storage/supabase-storage.client';

export class StorageService {
  constructor(private readonly storageClient = new SupabaseStorageClient()) {}

  async upload(bucket: string, path: string, buffer: Buffer, contentType?: string) {
    await this.storageClient.uploadFile(bucket, path, buffer, contentType);
  }

  async download(bucket: string, path: string) {
    return this.storageClient.downloadFile(bucket, path);
  }

  getPublicUrl(bucket: string, path: string) {
    return this.storageClient.getPublicUrl(bucket, path);
  }

  async removeFile(bucket: string, path: string) {
    return this.storageClient.removeFile(bucket, path);
  }
}
