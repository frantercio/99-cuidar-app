import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropModalProps {
    src: string;
    onClose: () => void;
    onCropComplete: (croppedImageUrl: string) => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ src, onClose, onCropComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const ASPECT_RATIO = 16 / 6; // Aspect ratio for the cover photo

    const resetState = useCallback(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    useEffect(() => {
        resetState();
    }, [src, resetState]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !imageRef.current) return;
        const x = e.clientX - dragStart.x;
        const y = e.clientY - dragStart.y;
        
        const image = imageRef.current;
        const container = containerRef.current!;

        const imgWidth = image.clientWidth;
        const imgHeight = image.clientHeight;
        
        const maxX = (imgWidth - container.clientWidth) / 2;
        const minX = -maxX;
        
        const maxY = (imgHeight - container.clientHeight) / 2;
        const minY = -maxY;

        setPosition({
            x: Math.max(minX, Math.min(x, maxX)),
            y: Math.max(minY, Math.min(y, maxY)),
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleCrop = () => {
        const image = imageRef.current;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!image || !canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const outputWidth = 800;
        canvas.width = outputWidth;
        canvas.height = outputWidth / ASPECT_RATIO;
        
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        const sourceX = (container.clientWidth / 2 - position.x) * scaleX;
        const sourceY = (container.clientHeight / 2 - position.y) * scaleY;
        const sourceWidth = container.clientWidth * scaleX;
        const sourceHeight = container.clientHeight * scaleY;
        
        ctx.drawImage(
            image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            canvas.width,
            canvas.height
        );

        onCropComplete(canvas.toDataURL('image/jpeg'));
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in flex flex-col max-h-[90vh]">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ajustar Imagem da Capa</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                
                <div className="p-8 flex-grow overflow-hidden flex flex-col gap-6">
                    <div 
                        ref={containerRef}
                        className="w-full relative bg-gray-900 rounded-lg overflow-hidden cursor-move select-none"
                        style={{ aspectRatio: `${ASPECT_RATIO}` }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img 
                            ref={imageRef}
                            src={src}
                            alt="Preview da capa"
                            className="absolute top-1/2 left-1/2"
                            style={{
                                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                            }}
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 dark:text-gray-400">Zoom:</span>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                    </div>
                </div>

                <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl flex justify-end gap-4 flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-semibold transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleCrop} className="px-6 py-3 btn-gradient text-white rounded-xl font-semibold shadow-lg">
                        Salvar Imagem
                    </button>
                </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default ImageCropModal;