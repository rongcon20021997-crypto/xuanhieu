import { Category } from '../lib/supabase';

type Props = {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (cat: Category) => void;
};

export default function IPadSidebar({ categories, selectedCategory, onSelect }: Props) {
  return (
    <div className="w-56 border-r border-white/10 flex flex-col overflow-y-auto bg-[#0d1b3e]">
      <div className="px-4 pt-4 pb-2">
        <div className="w-8 h-0.5 bg-[#c9a84c] mb-4" />
      </div>
      <nav className="flex-1">
        {categories.map(cat => {
          const isSelected = selectedCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat)}
              className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all active:opacity-70 ${
                isSelected
                  ? 'bg-[#c9a84c]/20 border-l-2 border-[#c9a84c]'
                  : 'border-l-2 border-transparent hover:bg-white/5'
              }`}
            >
              <span
                className={`text-base font-medium truncate ${
                  isSelected ? 'text-[#c9a84c]' : 'text-white/80'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
