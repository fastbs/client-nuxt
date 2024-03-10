export interface FileDto {
	id: string,
	filename_disk: string,
	filename_download: string,
	title?: string,
	type: string,
	folder?: string,
	filesize?: number,
	description?: string,
}

export interface ImageDto extends FileDto {
	width: number;
	height: number;
};
