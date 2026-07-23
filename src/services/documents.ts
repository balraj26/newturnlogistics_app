import { apiFetch } from '@/lib/api-client';
import type { Document, DocumentOwnerType, DocumentType, UUID } from '@/types/api';

export interface DocumentInput {
  document_type: DocumentType;
  owner_type: DocumentOwnerType;
  owner_id: UUID;
  file_url: string;
  description?: string;
}

export interface DocumentUploadInput {
  document_type: DocumentType;
  owner_type: DocumentOwnerType;
  owner_id: UUID;
  description?: string;
  /** A local file URI (e.g. from expo-image-picker/expo-camera) plus enough
   * metadata to build a valid multipart part. */
  file: { uri: string; name: string; type: string };
}

/** Ported from New Turn/frontend/services/documents.ts, plus a real-file
 * upload variant — the web app never captures a camera photo, but a
 * driver's proof-of-delivery or a gatekeeper's ID/seal photo does. */
export const documentsService = {
  listForOwner: (ownerType: DocumentOwnerType, ownerId: UUID) =>
    apiFetch<Document[]>(`/api/v1/documents?owner_type=${ownerType}&owner_id=${ownerId}`),
  upload: (data: DocumentInput) =>
    apiFetch<Document>('/api/v1/documents', { method: 'POST', body: data }),

  uploadFile: (data: DocumentUploadInput) => {
    const form = new FormData();
    form.append('document_type', data.document_type);
    form.append('owner_type', data.owner_type);
    form.append('owner_id', data.owner_id);
    if (data.description) form.append('description', data.description);
    // React Native's FormData accepts this {uri,name,type} shape directly —
    // it is not a real web File/Blob, but fetch's RN polyfill knows how to
    // stream it from disk.
    form.append('file', data.file as unknown as Blob);

    return apiFetch<Document>('/api/v1/documents/upload', { method: 'POST', form });
  },

  fileUrl: (documentId: UUID) => `/api/v1/documents/${documentId}/file`,
};
