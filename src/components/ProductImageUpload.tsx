
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ProductImageUploadProps {
  imageUrl?: string;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  imageUrl,
  onImageChange,
  className = ''
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Converter para base64 para persistir no localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target?.result as string;
        setPreviewUrl(base64Url);
        onImageChange(base64Url);
        console.log('📷 Imagem convertida para base64 e salva');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm font-medium text-gray-300">Imagem do Produto</div>
      
      {previewUrl ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview do produto"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Trocar Imagem
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`bg-gray-800 border-gray-700 transition-colors ${
            isDragOver ? 'border-violet-500 bg-violet-500/10' : ''
          }`}
        >
          <CardContent 
            className="p-8 text-center cursor-pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-300 font-medium">
                  Clique para fazer upload ou arraste uma imagem
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  PNG, JPG, JPEG até 5MB
                </p>
              </div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Imagem
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
