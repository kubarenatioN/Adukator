export interface CloudinaryFile {
    asset_id: string,
    public_id: string,
    folder: string,
    filename: string,
    url: string,
    format: string,
    resource_type: 'image' | 'raw' | 'video',
    uploaded_at: string;
}

export interface UserFile {
    filename: string;
    url?: string;
    uploadedAt?: string;
}