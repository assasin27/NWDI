import { supabase } from './supabaseClient';

const BUCKET_NAME = 'nareshwadi-products';

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${path}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrl;
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  // Extract the file path from the URL
  const url = new URL(fileUrl);
  const pathSegments = url.pathname.split('/');
  const bucketName = pathSegments[2];
  const filePath = pathSegments.slice(3).join('/');

  if (bucketName !== BUCKET_NAME) {
    throw new Error('Invalid bucket');
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw error;
  }
};

export const getFileUrl = (path: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return data.publicUrl;
};
