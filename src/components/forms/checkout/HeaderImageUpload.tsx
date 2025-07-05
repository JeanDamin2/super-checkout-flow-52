import { Label } from '@/components/ui/label';

interface HeaderImageUploadProps {
  headerImageUrl: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HeaderImageUpload = ({
  headerImageUrl,
  onImageUpload
}: HeaderImageUploadProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Imagem de Cabeçalho</h3>
      <div>
        <Label htmlFor="headerImage" className="text-gray-300">Imagem de Cabeçalho</Label>
        <input
          id="headerImage"
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>
      {headerImageUrl && (
        <div className="mt-4">
          <p className="text-gray-300 mb-2">Pré-visualização:</p>
          <img 
            src={headerImageUrl} 
            alt="Pré-visualização do cabeçalho"
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-600"
          />
        </div>
      )}
    </div>
  );
};