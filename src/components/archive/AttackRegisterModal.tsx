'use client';

import { useState } from 'react';
import { useHeroStore, HERO_SKILL_ENUM } from '@/store/useHeroStore';
import { apiClient } from '@/lib/apiClient';
import HeroCard from '@/components/hero/HeroCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defenseId: string; // 타겟 방어덱 ID
}

// 스킬 예약 타입 (로컬 상태용)
interface SkillQueueItem {
  heroId: string;
  skillType: HERO_SKILL_ENUM;
}

export default function AttackRegisterModal({ isOpen, onClose, defenseId }: Props) {
  const { heroes } = useHeroStore();

  // --- 상태 관리 ---
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const [skillQueue, setSkillQueue] = useState<SkillQueueItem[]>([]); // [New] 스킬 예약 큐
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const heroList = Object.values(heroes);

  // 영웅 선택 토글
  const toggleHero = (id: string) => {
    setSelectedHeroes((prev) => {
      // 이미 선택된 영웅이면 제거 (스킬 예약도 초기화)
      if (prev.includes(id)) {
        setSkillQueue([]);
        return prev.filter((h) => h !== id);
      }
      // 추가
      if (prev.length < 3) return [...prev, id];
      return prev;
    });
  };

  // [New] 스킬 예약 추가
  const addSkillReservation = (heroId: string, skillType: HERO_SKILL_ENUM) => {
    if (skillQueue.length >= 3) return; // 최대 3개
    setSkillQueue([...skillQueue, { heroId, skillType }]);
  };

  // [New] 스킬 예약 취소
  const removeSkillReservation = (index: number) => {
    setSkillQueue(skillQueue.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedHeroes.length !== 3) {
      alert('영웅 3명을 선택해야 합니다.');
      return;
    }

    setLoading(true);
    try {
      // [New] 스킬 예약 데이터 변환 (heroId -> heroIndex)
      const skillReservationDto = skillQueue.map((item) => ({
        heroIndex: selectedHeroes.indexOf(item.heroId),
        skillType: item.skillType,
      }));

      // POST /archive/attack
      await apiClient('/archive/attack', {
        method: 'POST',
        body: JSON.stringify({
          defenseId: defenseId,
          deck: {
            heroes: selectedHeroes,
            skillReservation: skillReservationDto, // 변환된 데이터 전송
          },
          description: description
        }),
      });

      alert('공략이 등록되었습니다.');
      onClose();
      window.location.reload();
    } catch (error: any) {
      alert(error.message || '공략 등록 실패');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* 헤더 */}
        <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">⚔️ 공략(공격덱) 추가</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">

          {/* 섹션 1: 덱 선택 + 설명 입력 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 좌측: 덱 선택 슬롯 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3">1. 공격덱 구성 (3명)</label>
              <div className="flex justify-start gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                {[0, 1, 2].map((idx) => {
                  const hid = selectedHeroes[idx];
                  return (
                    <div key={idx} className="w-16 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {hid ? (
                        <div className="w-full h-full bg-red-50 border-red-500 border rounded-lg flex flex-col items-center justify-center relative overflow-hidden cursor-pointer" onClick={() => toggleHero(hid)}>
                          <span className="font-black text-2xl text-red-200">{heroes[hid]?.name.slice(0, 1)}</span>
                          <div className="absolute bottom-0 w-full bg-red-500 text-white text-[9px] text-center">{heroes[hid]?.name}</div>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xl font-bold">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 우측: 설명 입력 */}
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-3">추가 팁 / 설명</label>
              <textarea
                className="w-full h-[100px] p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="ex: 펫 추천, 전반 추천, 추천 이유"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>

          {/* [New] 섹션 2: 스킬 예약 (3명 다 선택되었을 때만 노출) */}
          {selectedHeroes.length === 3 && (
            <section className="animate-fade-in">
              <h3 className="text-sm font-bold text-gray-700 mb-3">2. 스킬 우선순위 예약 (선택)</h3>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                {/* 예약 현황판 */}
                <div className="flex gap-3 mb-6 p-3 bg-gray-50 rounded-lg justify-center min-h-[50px] items-center border border-gray-100">
                  {skillQueue.length === 0 && <span className="text-gray-400 text-xs">스킬 버튼을 눌러 순서를 지정하세요</span>}
                  {skillQueue.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => removeSkillReservation(idx)}
                      className="flex items-center gap-2 bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-gray-100 hover:text-gray-600 transition group"
                    >
                      <span className="font-bold text-xs bg-red-100 group-hover:bg-gray-200 px-1.5 rounded">{idx + 1}</span>
                      <span className="font-bold text-sm">{heroes[item.heroId]?.name}</span>
                      <span className="text-xs font-bold">{item.skillType === HERO_SKILL_ENUM.SKILL_1 ? '1스' : '2스'}</span>
                    </div>
                  ))}
                </div>

                {/* 스킬 선택 버튼들 */}
                <div className="grid grid-cols-3 gap-4">
                  {selectedHeroes.map((hid) => (
                    <div key={hid} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-sm font-bold text-gray-700">{heroes[hid]?.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addSkillReservation(hid, HERO_SKILL_ENUM.SKILL_1)}
                          disabled={skillQueue.length >= 3}
                          className="w-8 h-8 rounded bg-white border border-gray-300 shadow-sm text-xs font-bold hover:bg-yellow-100 hover:border-yellow-400 hover:text-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          1
                        </button>
                        <button
                          onClick={() => addSkillReservation(hid, HERO_SKILL_ENUM.SKILL_2)}
                          disabled={skillQueue.length >= 3}
                          className="w-8 h-8 rounded bg-white border border-gray-300 shadow-sm text-xs font-bold hover:bg-yellow-100 hover:border-yellow-400 hover:text-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          2
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <hr className="border-gray-200" />

          {/* 섹션 3: 영웅 선택 리스트 */}
          <section>
            <h3 className="text-sm font-bold text-gray-500 mb-3">전체 영웅 목록</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {heroList.map((hero) => {
                const isSelected = selectedHeroes.includes(hero._id);
                const isFull = selectedHeroes.length >= 3;
                const isDisabled = isFull && !isSelected;

                return (
                  <div
                    key={hero._id}
                    className={`relative cursor-pointer transition-transform hover:scale-105 ${isDisabled ? 'opacity-40 grayscale' : ''}`}
                    onClick={() => !isDisabled && toggleHero(hero._id)}
                    style={{ transform: 'scale(0.8)', margin: '-10px' }}
                  >
                    <HeroCard heroId={hero._id} mode="SIMPLE" className={isSelected ? 'ring-2 ring-red-500 rounded-xl' : ''} />
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md z-30">✓</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">취소</button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedHeroes.length !== 3}
            className={`px-6 py-2 rounded-lg font-bold text-white transition ${loading || selectedHeroes.length !== 3 ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}