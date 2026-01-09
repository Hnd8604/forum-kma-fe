import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Paperclip, Film, X, Loader2 } from 'lucide-react';
import { FileUploadService } from '@/lib/file-upload.service';
import { toast } from 'sonner';
import type { MessageType } from '@/interfaces/chat.types';

interface ChatMediaUploadProps {
    onUpload: (urls: string[], type: MessageType) => void;
    disabled?: boolean;
}

interface UploadingFile {
    id: string;
    file: File;
    preview?: string;
    progress: number;
    type: 'image' | 'video' | 'file';
}

export default function ChatMediaUpload({ onUpload, disabled }: ChatMediaUploadProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (
        files: FileList | null,
        type: 'image' | 'video' | 'file'
    ) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);

        // Validate files before upload
        const fileUploadType = type === 'file' ? 'document' : type;
        for (const file of fileArray) {
            const validation = FileUploadService.validateFile(file, fileUploadType);
            if (!validation.valid) {
                toast.error(validation.error || `File không hợp lệ: ${file.name}`);
                return;
            }
        }

        const newUploadingFiles: UploadingFile[] = fileArray.map((file) => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: type === 'image' ? URL.createObjectURL(file) :
                type === 'video' ? URL.createObjectURL(file) : undefined,
            progress: 0,
            type,
        }));

        setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);
        setIsUploading(true);

        try {
            const uploadedUrls: string[] = [];

            for (const uploadingFile of newUploadingFiles) {
                try {
                    let url: string;

                    switch (type) {
                        case 'image':
                            url = await FileUploadService.uploadImage(
                                uploadingFile.file,
                                (progress) => {
                                    setUploadingFiles((prev) =>
                                        prev.map((f) =>
                                            f.id === uploadingFile.id ? { ...f, progress } : f
                                        )
                                    );
                                }
                            );
                            break;
                        case 'video':
                            url = await FileUploadService.uploadVideo(
                                uploadingFile.file,
                                (progress) => {
                                    setUploadingFiles((prev) =>
                                        prev.map((f) =>
                                            f.id === uploadingFile.id ? { ...f, progress } : f
                                        )
                                    );
                                }
                            );
                            break;
                        case 'file':
                            url = await FileUploadService.uploadDocument(
                                uploadingFile.file,
                                (progress) => {
                                    setUploadingFiles((prev) =>
                                        prev.map((f) =>
                                            f.id === uploadingFile.id ? { ...f, progress } : f
                                        )
                                    );
                                }
                            );
                            break;
                        default:
                            throw new Error('Unknown file type');
                    }

                    uploadedUrls.push(url);
                } catch (error: any) {
                    console.error('Failed to upload file:', error);
                    toast.error(`Không thể tải lên: ${uploadingFile.file.name}`);
                }
            }

            if (uploadedUrls.length > 0) {
                const messageType: MessageType =
                    type === 'image' ? 'IMAGE' : type === 'video' ? 'VIDEO' : 'FILE';
                console.log('[ChatMediaUpload] Upload complete, URLs:', uploadedUrls, 'Type:', messageType);
                onUpload(uploadedUrls, messageType);
            }
        } finally {
            setUploadingFiles([]);
            setIsUploading(false);
        }
    };

    const removeUploadingFile = (id: string) => {
        setUploadingFiles((prev) => {
            const file = prev.find((f) => f.id === id);
            if (file?.preview) {
                URL.revokeObjectURL(file.preview);
            }
            return prev.filter((f) => f.id !== id);
        });
    };

    return (
        <div className="relative">
            {/* Preview uploading files */}
            {uploadingFiles.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white border border-slate-200 rounded-lg shadow-lg">
                    <div className="flex flex-wrap gap-2">
                        {uploadingFiles.map((file) => (
                            <div key={file.id} className="relative">
                                {file.type === 'image' && file.preview ? (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                                        <img
                                            src={file.preview}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">
                                                {file.progress}%
                                            </span>
                                        </div>
                                    </div>
                                ) : file.type === 'video' && file.preview ? (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 relative">
                                        <video
                                            src={file.preview}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Film className="w-4 h-4 text-white mb-1" />
                                            <span className="text-white text-xs font-medium absolute bottom-1">
                                                {file.progress}%
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                                        {file.type === 'video' ? (
                                            <Film className="w-6 h-6 text-slate-400" />
                                        ) : (
                                            <Paperclip className="w-6 h-6 text-slate-400" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                                            <span className="text-white text-xs font-medium">
                                                {file.progress}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <button
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                                    onClick={() => removeUploadingFile(file.id)}
                                >
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload buttons */}
            <div className="flex items-center gap-1">
                {/* Image upload */}
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files, 'image')}
                    disabled={disabled || isUploading}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    title="Gửi ảnh"
                >
                    {isUploading && uploadingFiles[0]?.type === 'image' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Image className="w-4 h-4" />
                    )}
                </Button>

                {/* Video upload */}
                <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files, 'video')}
                    disabled={disabled || isUploading}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    title="Gửi video"
                >
                    {isUploading && uploadingFiles[0]?.type === 'video' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Film className="w-4 h-4" />
                    )}
                </Button>

                {/* File upload */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.zip,.rar"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files, 'file')}
                    disabled={disabled || isUploading}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    title="Gửi file"
                >
                    {isUploading && uploadingFiles[0]?.type === 'file' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Paperclip className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
