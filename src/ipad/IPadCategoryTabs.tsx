import { Category } from '../lib/supabase';
import { LayoutGrid } from 'lucide-react';

type Props = {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (cat: Category) => void;
};

export default function IPadCategoryTabs({ categories, selectedCategory, onSelect }: Props) {
  return (
    <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
      {categories.map(cat => {
        const isSelected = selectedCategory?.id === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className="flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200 active:scale-95 relative overflow-hidden"
            style={{
              background: isSelected
                ? 'linear-gradient(135deg, rgba(201,168,76,0.18), rgba(160,120,48,0.12))'
                : 'rgba(255,255,255,0.03)',
              border: isSelected
                ? '1px solid rgba(201,168,76,0.45)'
                : '1px solid rgba(255,255,255,0.07)',
              boxShadow: isSelected
                ? '0 4px 20px rgba(201,168,76,0.12), inset 0 1px 0 rgba(201,168,76,0.1)'
                : 'none',
            }}
          >
            {/* Subtle shimmer line at top when selected */}
            {isSelected && (
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)' }} />
            )}

            <div className="p-2 rounded-full transition-all"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #c9a84c, #a07830)'
                  : 'rgba(255,255,255,0.06)',
                color: isSelected ? '#0a0a0a' : '#5a4a30',
                boxShadow: isSelected ? '0 2px 8px rgba(201,168,76,0.3)' : 'none',
              }}>
              <LayoutGrid size={18} />
            </div>

            <div className="text-left">
              <p className="font-semibold text-sm"
                style={{ color: isSelected ? '#c9a84c' : '#7a6a50' }}>
                {cat.name}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: '#4a3a20' }}>Xem danh mục</p>
            </div>

            {isSelected && (
              <div className="absolute top-0 right-0 px-1.5 py-0.5 rounded-bl-lg text-[9px] font-bold"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #a07830)', color: '#0a0a0a' }}>
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
