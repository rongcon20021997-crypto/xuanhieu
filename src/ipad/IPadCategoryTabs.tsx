import { Category } from '../lib/supabase';
import { LayoutGrid } from 'lucide-react';

type Props = {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (cat: Category) => void;
};

export default function IPadCategoryTabs({ categories, selectedCategory, onSelect }: Props) {
  // We can add a "Tất cả" tab if we want, but sticking to real categories for now
  return (
    <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
      {categories.map(cat => {
        const isSelected = selectedCategory?.id === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className={`flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${
              isSelected
                ? 'border-[#b08d3a] bg-[#b08d3a]/5 shadow-sm'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            } relative overflow-hidden`}
          >
            <div className={`p-2 rounded-full ${isSelected ? 'bg-[#b08d3a] text-white' : 'bg-gray-100 text-gray-500'}`}>
              <LayoutGrid size={20} />
            </div>
            <div className="text-left">
              <p className={`font-semibold ${isSelected ? 'text-[#b08d3a]' : 'text-gray-800'}`}>
                {cat.name}
              </p>
              <p className="text-[11px] text-gray-500">Xem danh mục</p>
            </div>
            {isSelected && (
              <div className="absolute top-0 right-0 bg-[#b08d3a] text-white px-1.5 py-0.5 rounded-bl-lg text-[10px]">
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
