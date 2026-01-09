'use client';

import { useHeroStore } from '@/store/useHeroStore';
import { ArchiveSearchResponseDto, ATTACK_SCORE_ENUM } from '@/types/archive.type';

interface Props {
  results: ArchiveSearchResponseDto[] | null;
  onRegisterDefense: () => void;
  onRegisterAttack: (defenseId: string) => void;
}

export default function ArchiveResultSection({ results, onRegisterDefense, onRegisterAttack }: Props) {
  const { heroes } = useHeroStore();

  const getScoreColor = (score: ATTACK_SCORE_ENUM) => {
    switch (score) {
      case ATTACK_SCORE_ENUM.NICE: return 'bg-purple-100 text-purple-700 border-purple-200';
      case ATTACK_SCORE_ENUM.GOOD: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ATTACK_SCORE_ENUM.TRY: return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // 날짜 포맷팅 헬퍼 (안전하게 처리)
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  return (
    <div className="animate-slide-up space-y-8">
      {!results || results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="text-5xl mb-4">🤷‍♂️</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">데이터가 없습니다.</h2>
          <p className="text-sm text-gray-500 mb-6">이 방어덱 조합을 처음 발견하셨나요?<br />방어덱을 등록하고 공략을 공유해보세요!</p>
          <button onClick={onRegisterDefense} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition transform hover:-translate-y-0.5 text-sm">
            + 방어덱 등록하기
          </button>
        </div>
      ) : (
        results.map((defense) => (
          <div key={defense.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-start gap-1">
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">DEFENSE</span>
                  {defense.isDefault && <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-300">기본 덱</span>}
                </div>
                <div className="flex items-center gap-2">
                  {/* [수정] deck이나 heroes가 없을 경우를 대비해 Optional Chaining (?.) 추가 */}
                  {defense.deck?.heroes?.map((hid) => (
                    <div key={hid} className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-200 relative">
                      {heroes[hid] ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white font-bold text-xs">
                          {heroes[hid].name.slice(0, 1)}
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-[10px] text-gray-500">?</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => onRegisterAttack(defense.id)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition border border-blue-100">
                + 이 덱 공략 추가
              </button>
            </div>

            <div className="p-4 bg-gray-50/50">
              {defense.attacks && defense.attacks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {defense.attacks.map((attack) => (
                    <div key={attack.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200 hover:border-blue-200 group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getScoreColor(attack.score)}`}>{attack.score}</span>
                          <span className="text-xs font-bold text-gray-700">{attack.authorName}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{formatDate(attack.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded-lg w-fit">
                        <span className="text-[10px] font-bold text-gray-400 mr-1">ATTACK</span>
                        {/* [수정] deck이나 heroes가 없을 경우를 대비해 Optional Chaining (?.) 추가 */}
                        {attack.deck?.heroes?.map((hid) => (
                          <div key={hid} className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm">
                            {heroes[hid] ? heroes[hid].name.slice(0, 1) : '?'}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">{attack.description || '설명이 없습니다.'}</p>
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-6 text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl bg-white">아직 등록된 공략이 없습니다. <br />첫 번째 승리 공식을 공유해주세요!</div>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}