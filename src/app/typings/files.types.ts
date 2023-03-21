export interface UserFile {
    asset_id: string,
    public_id: string,
    folder: string,
    filename: string,
    url: string,
    format: string,
    resource_type: 'image' | 'raw' | 'video',
}