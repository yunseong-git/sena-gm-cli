'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hero } from '@/types/hero.type';

interface Props {
  allHeroes: Hero[];
}

// 타입별 배경색 (Tailwind)
const typeColors: Record<string, string> = {
  '공격형': 'bg-red-200 border-red-400',
  '마법형': 'bg-blue-200 border-blue-400',
  '방어형': 'bg-green-200 border-green-400',
  '만능형': 'bg-gray-300 border-gray-500',
  '지원형': 'bg-pink-200 border-pink-400',
};

export function HeroSearchClient({ allHeroes }: Props) {
  const router = useRouter();
  const [selectedHeroes, setSelectedHeroes] = useState<Hero[]>([]);

  const toggleHeroSelect = (hero: Hero) => {
    setSelectedHeroes((prev) => {
      const isSelected = prev.find((h) => h._id === hero._id);
      if (isSelected) {
        // 선택 해제
        return prev.filter((h) => h._id !== hero._id);
      } else {
        // 3개까지만 선택
        if (prev.length < 3) {
          return [...prev, hero];
        }
        return prev; // 3개 꽉 차면 더이상 추가 안 함
      }
    });
  };

  const handleSearch = () => {
    if (selectedHeroes.length !== 3) {
      alert('방어덱 영웅 3명을 선택해야 합니다.');
      return;
    }
    // ID를 콤마로 연결하여 URL 파라미터 생성
    const heroIds = selectedHeroes.map((h) => h._id).join(',');

    if (!heroIds || heroIds.includes('undefined')) {
      console.error("Selected hero IDs are invalid:", heroIds);
      alert('영웅 ID가 올바르지 않습니다. 페이지를 새로고침 해주세요.');
      return;
    }
    // 통계 페이지로 이동
    router.push(`/stats/${heroIds}`);
  };

  return (
    <div className="w-full">
      {/* 선택된 영웅 표시 (와이어프레임 상단) */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-4 border rounded-lg min-h-[80px] bg-gray-50">
        {selectedHeroes.map((hero) => (
          <div
            key={hero._id}
            className={`p-2 rounded border text-center font-bold ${typeColors[hero.type] || 'bg-gray-200'}`}
            onClick={() => toggleHeroSelect(hero)} // 클릭해서 제거
          >
            <div className="text-xs text-gray-600">{hero.type}</div>
            {hero.name}
          </div>
        ))}
      </div>

      {/* 검색 버튼 */}
      <button
        onClick={handleSearch}
        disabled={selectedHeroes.length !== 3}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mb-6 disabled:bg-gray-400"
      >
        검색
      </button>

      {/* 전체 영웅 목록 (선택 그리드) */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {allHeroes.map((hero) => {
          const isSelected = selectedHeroes.find((h) => h._id === hero._id);
          return (
            <button
              key={hero._id}
              onClick={() => toggleHeroSelect(hero)}
              className={`p-2 rounded border text-center font-semibold 
                ${typeColors[hero.type] || 'bg-gray-200'}
                ${isSelected ? 'ring-4 ring-red-500' : ''}
                ${!isSelected && selectedHeroes.length === 3 ? 'opacity-30' : ''}
              `}
            >
              <div className="text-xs text-gray-600">{hero.type}</div>
              {hero.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}