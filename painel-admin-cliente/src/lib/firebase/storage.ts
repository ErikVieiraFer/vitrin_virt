import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

export const uploadImage = async (
  file: File,
  path: string
): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const deleteImage = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

export const uploadServiceImage = async (
  tenantId: string,
  serviceId: string,
  file: File
): Promise<string> => {
  const filename = `${Date.now()}_${file.name}`;
  const path = `tenants/${tenantId}/services/${serviceId}/${filename}`;
  return uploadImage(file, path);
};

export const uploadTenantLogo = async (
  tenantId: string,
  file: File
): Promise<string> => {
  const filename = `${Date.now()}_${file.name}`;
  const path = `tenants/${tenantId}/logo/${filename}`;
  return uploadImage(file, path);
};
