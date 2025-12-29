'use client';

import { useEffect, useState } from 'react';
import { useHeroStore } from '@/store/useHeroStore';
import { apiClient } from '@/lib/apiClient';
import HeroCard from '@/components/hero/HeroCard';

export default function GuildArchivePage() {
  const { heroes, setHeroes } = useHeroStore();
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]); // 선택된 영웅 ID 목록 (최대 3개)
  const [loading, setLoading] = useState(false);

  // 1. 영웅 데이터 로드 (없으면 API 호출)
  useEffect(() => {
    const fetchHeroes = async () => {
      // 이미 데이터가 있으면 로딩 생략 (선택 사항)
      if (Object.keys(heroes).length > 0) return;

      setLoading(true);
      try {
        const data = await apiClient('/hero');
        const heroList = Array.isArray(data) ? data : data.payload;
        if (heroList) {
          setHeroes(heroList);
        }
      } catch (error) {
        console.error('영웅 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroes();
  }, [heroes, setHeroes]);

  const heroList = Object.values(heroes);

  // 2. 영웅 선택/해제 핸들러
  const toggleHeroSelection = (heroId: string) => {
    setSelectedHeroes((prev) => {
      // 이미 선택된 영웅이면 제거
      if (prev.includes(heroId)) {
        return prev.filter((id) => id !== heroId);
      }
      // 선택되지 않았고, 아직 3명이 안 찼으면 추가
      if (prev.length < 3) {
        return [...prev, heroId];
      }
      // 3명이 꽉 찼으면 아무것도 안 함 (또는 알림)
      return prev;
    });
  };

  // 3. 검색 핸들러 (추후 구현)
  const handleSearch = () => {
    if (selectedHeroes.length !== 3) return;
    const query = selectedHeroes.join(',');
    alert(`검색 시작! (ID: ${query})`);
    // router.push(`/guild-archive/${query}`); // 나중에 구현
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🏰 길드 아카이브</h1>

        {/* --- 상단: 검색 슬롯 영역 (Sticky) --- */}
        <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex flex-col gap-2 w-full md:w-auto">
            <h2 className="font-bold text-gray-800 text-lg">방어덱 검색</h2>
            <p className="text-sm text-gray-500">상대방의 방어덱 영웅 3명을 선택하세요.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* 3개의 슬롯 */}
            <div className="flex gap-3">
              {[0, 1, 2].map((index) => {
                const heroId = selectedHeroes[index];
                const hero = heroes[heroId];

                return (
                  <div
                    key={index}
                    onClick={() => heroId && toggleHeroSelection(heroId)}
                    className={`w-20 h-24 md:w-24 md:h-32 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${heroId
                        ? 'border-blue-500 bg-blue-50 shadow-md hover:bg-red-50 hover:border-red-400 group relative overflow-hidden'
                        : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    {heroId && hero ? (
                      <>
                        {/* 영웅 초성 (작게 표시) */}
                        <span className="text-4xl font-black text-blue-200 select-none group-hover:text-red-200 transition-colors">
                          {hero.name.slice(0, 1)}
                        </span>
                        {/* 이름 */}
                        <div className="absolute bottom-0 w-full bg-blue-500 text-white text-[10px] md:text-xs text-center py-1 font-bold group-hover:bg-red-500 transition-colors truncate px-1">
                          {hero.name}
                        </div>
                        {/* 호버 시 X 아이콘 */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-300 text-2xl font-bold">+</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 검색 버튼 */}
            <button
              onClick={handleSearch}
              disabled={selectedHeroes.length !== 3}
              className={`h-12 px-8 rounded-xl font-bold text-lg transition shadow-sm whitespace-nowrap ${selectedHeroes.length === 3
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              검색
            </button>
          </div>
        </div>

        {/* --- 하단: 영웅 목록 --- */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
            {heroList.length > 0 ? (
              heroList.map((hero) => {
                const isSelected = selectedHeroes.includes(hero._id);
                // 3명이 꽉 찼고, 선택되지 않은 영웅은 흐리게 처리
                const isDisabled = selectedHeroes.length >= 3 && !isSelected;

                return (
                  <div
                    key={hero._id}
                    className={`relative transition-all duration-200 ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2 rounded-xl scale-105 z-10' : ''
                      } ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}`}
                  >
                    <HeroCard
                      heroId={hero._id}
                      mode="SIMPLE"
                      onClick={() => !isDisabled && toggleHeroSelection(hero._id)}
                      className={isSelected ? 'pointer-events-none' : ''} // 선택된 상태에서는 클릭 이벤트 중복 방지 (부모 div에서 처리)
                    />

                    {/* 선택됨 뱃지 */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md z-20 font-bold">
                        {selectedHeroes.indexOf(hero._id) + 1}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-gray-400 py-20">
                등록된 영웅 데이터가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}