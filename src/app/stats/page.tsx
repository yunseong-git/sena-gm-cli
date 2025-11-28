import { Hero } from '@/types/hero.type';
import { HeroesStatsResponse } from '@/types/stats.type';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';

interface PageProps {
  searchParams: {
    heroes?: string;
  };
}

// 1. 영웅 통계 데이터 가져오기 (GET /stats/heroes)
async function getStats(heroIds: string): Promise<HeroesStatsResponse[]> {
  try {
    // stats.controller.ts의 getHeoresMatchStats
    // GetHeroesStatsQueryDto
    const stats = await apiClient(`/stats?heroes=${heroIds}`);
    return stats;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return [];
  }
}

// 2. 모든 영웅 정보 가져오기 (ID를 이름으로 매핑하기 위함)
async function getHeroes(): Promise<Hero[]> {
  try {
    const heroes = await apiClient('/hero'); //
    return heroes;
  } catch (error) {
    return [];
  }
}

// 타입별 배경색
const typeColors: Record<string, string> = {
  '공격형': 'bg-yellow-200 border-yellow-400',
  '마법형': 'bg-blue-200 border-blue-400',
  '방어형': 'bg-gray-300 border-gray-500',
  '만능형': 'bg-green-200 border-green-400',
  '지원형': 'bg-pink-200 border-pink-400',
};

// 헬퍼 컴포넌트: 영웅 칩
const HeroChip = ({ hero }: { hero: Hero | undefined }) => {
  if (!hero) return <div className="p-2 rounded border bg-gray-100">?</div>;
  return (
    <div className={`p-2 rounded border text-center font-bold ${typeColors[hero.type] || 'bg-gray-200'}`}>
      <div className="text-xs text-gray-600">{hero.type}</div>
      {hero.name}
    </div>
  );
};

// 영웅 통계 페이지 (서버 컴포넌트)
export default async function StatsResultPage({ searchParams }: PageProps) {
  const { heroes: heroIds } = searchParams;

  // 3. API 병렬 호출
  // heroIds가 없는 경우(예: /stats로 직접 접근) API 호출을 스킵
  const [stats, allHeroes] = await Promise.all([
    heroIds ? getStats(heroIds) : Promise.resolve([]),
    getHeroes(),
  ]);

  // heroIds가 없으면 렌더링 중단
  if (!heroIds) {
    return (
      <main className="flex min-h-screen flex-col items-center p-4 pt-12 max-w-lg mx-auto">
        <h1 className="text-2xl text-red-500">
          잘못된 접근입니다. 검색 페이지에서 영웅을 선택해주세요.
        </h1>
        <Link href="/" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          검색으로 돌아가기
        </Link>
      </main>
    )
  }
  // 4. 영웅 ID 매핑
  const heroMap = new Map<string, Hero>(
    allHeroes.map((hero) => [hero._id, hero])
  );
  const defenseHeroes = heroIds.split(',').map(id => heroMap.get(id));

  return (
    <main className="flex min-h-screen flex-col items-center p-4 pt-12 max-w-lg mx-auto">
      <h1 className="text-4xl font-bold mb-4">SenaDBs</h1>

      {/* 1. 방어덱 (검색 조건) */}
      <div className="grid grid-cols-3 gap-2 mb-2 w-full">
        {defenseHeroes.map((hero) => (
          <HeroChip key={hero?._id || 'defense-empty'} hero={hero} />
        ))}
      </div>
      <div className="text-5xl font-bold my-2">VS</div>

      {/* 2. 통계 탭 (기본) */}
      <div className="w-full bg-gray-200 p-1 rounded-lg mb-4">
        <button className="w-1/2 bg-white rounded-md py-2 font-semibold shadow">통계</button>
        <button className="w-1/2 py-2 font-semibold text-gray-600">최근전적</button>
      </div>

      {/* 3. 통계 결과 리스트 */}
      <div className="space-y-3 w-full">
        {stats.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            데이터가 없습니다.
          </div>
        )}

        {stats.map((stat) => {
          const attackHeroes = stat.attackDeckHeroes.map(id => heroMap.get(id));
          return (
            <div key={stat._id} className="bg-white p-3 rounded-lg shadow border border-gray-200">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {attackHeroes.map((hero) => (
                  <HeroChip key={hero?._id || 'attack-empty'} hero={hero} />
                ))}
              </div>
              <div className="flex justify-between items-stretch gap-2">
                {/* 스코어/승률 */}
                <div className="flex-1 bg-gray-100 p-2 rounded text-center">
                  <div className="text-sm">Score: <span className="font-bold text-lg">{stat.avgEvaluation.toFixed(1)}</span></div>
                  <div className="text-sm">승률: <span className="font-bold text-lg">{stat.winRate.toFixed(0)}%</span></div>
                  <div className="text-xs text-gray-500">매치: {stat.matchCount}</div>
                </div>

                {/* 버튼 */}
                <div className="flex-1 flex flex-col gap-2">
                  {/*
                    이 버튼은 <Link>를 사용해야 합니다.
                    href={`/stats/${heroIds}/skills/${stat._id}`}
                    (스킬 통계 모달은 다음 단계에서 구현합니다)
                  */}
                  <button className="flex-1 bg-gray-600 text-white rounded py-2 text-sm font-semibold">
                    스킬통계
                  </button>
                  <button className="flex-1 bg-gray-600 text-white rounded py-2 text-sm font-semibold">
                    한줄평
                  </button>
                </div>

                {/* 버프/너프 */}
                <div className="flex-1 flex flex-col gap-2 text-center">
                  <div className="flex-1 bg-blue-100 rounded p-1">
                    <span className="text-xs">버프</span> <span className="font-bold">{stat.buffCount}</span>
                  </div>
                  <div className="flex-1 bg-red-100 rounded p-1">
                    <span className="text-xs">너프</span> <span className="font-bold">{stat.nurfCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}