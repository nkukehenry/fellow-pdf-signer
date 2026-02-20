export interface Position {
    x: number;
    y: number;
}

export interface SignatureInstance {
    id: string;
    type: 'image' | 'drawing' | 'text' | 'annotation';
    data: string; // base64 or text
    pageNumber: number;
    position: Position;
    width: number;
    height: number;
    dateStamp?: string;
}

export interface PdfMetadata {
    name: string;
    pageCount: number;
    size: number;
}
