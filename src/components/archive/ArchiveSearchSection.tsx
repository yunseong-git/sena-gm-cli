'use client';

import { useHeroStore } from '@/store/useHeroStore';
import HeroCard from '@/components/hero/HeroCard';

interface Props {
  selectedHeroes: string[];
  onToggleHero: (id: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  loading: boolean;
}

export default function ArchiveSearchSection({ selectedHeroes, onToggleHero, onSearch, isSearching, loading }: Props) {
  const { heroes } = useHeroStore();
  const heroList = Object.values(heroes);

  return (
    <>
      {/* 상단: 검색 슬롯 */}
      <div className="sticky top-4 z-40 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-md border border-gray-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
        <div className="flex flex-col gap-1 w-full md:w-auto text-center md:text-left">
          <h2 className="font-bold text-gray-800 text-base">방어덱 검색</h2>
          <p className="text-xs text-gray-500">상대 방어덱 영웅 3명을 선택하세요.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
          <div className="flex gap-2">
            {[0, 1, 2].map((index) => {
              const heroId = selectedHeroes[index];
              const hero = heroes[heroId];
              return (
                <div
                  key={index}
                  onClick={() => heroId && onToggleHero(heroId)}
                  className={`w-14 h-16 rounded-lg border-2 flex items-center justify-center transition-all relative overflow-hidden cursor-pointer ${heroId ? 'border-blue-500 bg-blue-50 shadow-sm hover:border-red-400 hover:bg-red-50 group' : 'border-dashed border-gray-300 bg-gray-50'
                    }`}
                >
                  {heroId && hero ? (
                    <>
                      <span className="text-xl font-black text-blue-300 select-none group-hover:text-red-300">{hero.name.slice(0, 1)}</span>
                      <div className="absolute bottom-0 w-full bg-blue-500 text-white text-[9px] text-center py-0.5 font-bold truncate px-0.5 group-hover:bg-red-500">{hero.name}</div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/10 backdrop-blur-[1px]">
                        <svg className="w-5 h-5 text-red-600 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </div>
                    </>
                  ) : <span className="text-gray-300 text-lg font-bold">+</span>}
                </div>
              );
            })}
          </div>
          <button
            onClick={onSearch}
            disabled={selectedHeroes.length !== 3 || isSearching}
            className={`h-10 px-5 rounded-xl font-bold text-sm transition shadow-sm whitespace-nowrap ${selectedHeroes.length === 3 && !isSearching ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isSearching ? '검색 중...' : '검색'}
          </button>
        </div>
      </div>

      {/* 하단: 영웅 리스트 */}
      {loading ? (
        <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 justify-items-center animate-fade-in">
          {heroList.length > 0 ? heroList.map((hero) => {
            const isSelected = selectedHeroes.includes(hero._id);
            const isDisabled = selectedHeroes.length >= 3 && !isSelected;
            return (
              <div
                key={hero._id}
                className={`relative transition-all duration-200 origin-center ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 rounded-xl z-10 scale-95' : ''} ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:z-20'}`}
                style={{ transform: 'scale(0.85)', margin: '-10px' }}
              >
                <HeroCard
                  heroId={hero._id} mode="SIMPLE"
                  onClick={() => { if (!isDisabled) onToggleHero(hero._id); }}
                />
                {isSelected && (
                  <div className="absolute top-0 right-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md z-30">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
            );
          }) : <div className="col-span-full text-center text-gray-400 py-20">등록된 영웅 데이터가 없습니다.</div>}
        </div>
      )}
    </>
  );
}