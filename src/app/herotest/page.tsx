'use client';

import { useEffect, useState } from 'react';
import { useHeroStore } from '@/store/useHeroStore';
import { apiClient } from '@/lib/apiClient';
import HeroCard from '@/components/hero/HeroCard';

export default function HeroTestPage() {
  const { heroes, setHeroes } = useHeroStore();
  const [loading, setLoading] = useState(false);

  // 영웅 데이터 전체 로드 (없을 경우)
  useEffect(() => {
    const fetchHeroes = async () => {
      // 이미 스토어에 데이터가 있으면 로딩 생략 가능하지만, 
      // '전체 가져오기' 테스트를 위해 항상 호출하도록 함
      setLoading(true);
      try {
        // 백엔드 엔드포인트 가정: GET /hero (혹은 /hero/all)
        // 응답 구조가 배열이라고 가정
        const data = await apiClient('/hero');

        // 만약 응답이 { payload: [...] } 형태라면 data.payload 사용
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
  }, [setHeroes]);

  const heroList = Object.values(heroes);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">영웅 도감 (Test)</h1>
        <p className="text-gray-500 mb-8">
          총 <span className="font-bold text-blue-600">{heroList.length}</span>명의 영웅이 로드되었습니다.
          <br />
          <span className="text-xs">* 카드를 클릭하거나 하단 스킬 버튼에 마우스를 올려 상세 정보를 확인하세요.</span>
        </p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
            {heroList.length > 0 ? (
              heroList.map((hero) => (
                <HeroCard
                  key={hero._id}
                  heroId={hero._id}
                  mode="DETAIL"
                />
              ))
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