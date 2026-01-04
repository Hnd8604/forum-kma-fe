interface PostImageGalleryProps {
    images: string[];
    title: string;
    onImageClick?: (url: string) => void;
}

export default function PostImageGallery({
    images,
    title,
    onImageClick,
}: PostImageGalleryProps) {
    if (!images || images.length === 0) return null;

    const handleClick = (url: string) => {
        if (onImageClick) {
            onImageClick(url);
        } else {
            window.open(url, '_blank');
        }
    };

    if (images.length === 1) {
        // Single image - full width
        return (
            <div className="mb-3">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                    <img
                        src={images[0]}
                        alt={title}
                        className="w-full object-cover max-h-[500px] cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => handleClick(images[0])}
                    />
                </div>
            </div>
        );
    }

    if (images.length === 2) {
        // Two images - side by side
        return (
            <div className="mb-3">
                <div className="grid grid-cols-2 gap-2">
                    {images.map((url, index) => (
                        <div key={index} className="overflow-hidden rounded-xl aspect-square border border-slate-200">
                            <img
                                src={url}
                                alt={`${title} - ${index + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => handleClick(url)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (images.length === 3) {
        // Three images - first large, two small
        return (
            <div className="mb-3">
                <div className="grid grid-cols-2 gap-2">
                    <div className="row-span-2 overflow-hidden rounded-xl border border-slate-200">
                        <img
                            src={images[0]}
                            alt={`${title} - 1`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => handleClick(images[0])}
                        />
                    </div>
                    {images.slice(1).map((url, index) => (
                        <div key={index + 1} className="overflow-hidden rounded-xl aspect-square border border-slate-200">
                            <img
                                src={url}
                                alt={`${title} - ${index + 2}`}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => handleClick(url)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Four or more images - 2x2 grid, show +N overlay on 4th if more
    return (
        <div className="mb-3">
            <div className="grid grid-cols-2 gap-2">
                {images.slice(0, 4).map((url, index) => (
                    <div key={index} className="overflow-hidden rounded-xl aspect-square relative border border-slate-200">
                        <img
                            src={url}
                            alt={`${title} - ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => handleClick(url)}
                        />
                        {index === 3 && images.length > 4 && (
                            <div
                                className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                                onClick={() => handleClick(url)}
                            >
                                <span className="text-white text-3xl font-bold">
                                    +{images.length - 4}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
