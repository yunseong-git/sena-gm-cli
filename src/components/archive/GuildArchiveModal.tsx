'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useHeroStore } from '@/store/useHeroStore';
import { DeckDto } from '@/types/archive.type'; // 타입 재사용

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userRole: string; // 권한 확인용
}

export default function GuildArchiveModal({ isOpen, onClose, userRole }: Props) {
  const router = useRouter();
  const { heroes } = useHeroStore();

  const [view, setView] = useState<'MENU' | 'PICK'>('MENU');
  const [pickedDecks, setPickedDecks] = useState<DeckDto[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = ['MASTER', 'SUBMASTER'].includes(userRole?.toUpperCase() || '');

  // 추천 방어덱 조회 핸들러
  const handleFetchPicks = async () => {
    setLoading(true);
    try {
      // GET /archive/pick
      const data = await apiClient('/archive/pick');
      // 응답이 배열인지 payload인지 확인
      const decks = Array.isArray(data) ? data : data.payload || [];
      setPickedDecks(decks);
      setView('PICK');
    } catch (error) {
      console.error(error);
      alert('추천 방어덱을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 덱 검색 페이지로 이동
  const handleGoToSearch = () => {
    onClose();
    router.push('/archives');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">

        {/* 헤더 */}
        <div className="p-5 border-b flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {view === 'MENU' ? '🏰 길드 아카이브' : '🏆 추천 방어덱'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 min-h-[200px]">

          {/* [VIEW 1] 메뉴 선택 */}
          {view === 'MENU' && (
            <div className="flex flex-col gap-4">
              <button
                onClick={handleFetchPicks}
                className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-yellow-50 hover:border-yellow-300 shadow-sm transition group text-left"
              >
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition">
                  🏆
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">추천 방어덱</div>
                  <div className="text-xs text-gray-500">길드 관리자가 엄선한 덱 리스트</div>
                </div>
              </button>

              <button
                onClick={handleGoToSearch}
                className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 shadow-sm transition group text-left"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition">
                  🔍
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">덱 검색</div>
                  <div className="text-xs text-gray-500">영웅 조합으로 공략 찾아보기</div>
                </div>
              </button>
            </div>
          )}

          {/* [VIEW 2] 추천 방어덱 리스트 */}
          {view === 'PICK' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div></div>
              ) : pickedDecks.length > 0 ? (
                pickedDecks.map((deck, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-700">추천 덱 #{idx + 1}</span>
                    </div>
                    {/* 영웅 리스트 */}
                    <div className="flex items-center gap-3 justify-center bg-gray-50 p-3 rounded-lg">
                      {deck.heroes.map((hid) => (
                        <div key={hid} className="flex flex-col items-center gap-1">
                          <div className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center overflow-hidden shadow-sm">
                            <span className="font-bold text-gray-700">{heroes[hid]?.name.slice(0, 1)}</span>
                          </div>
                          <span className="text-[10px] text-gray-600 font-bold">{heroes[hid]?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-gray-800 font-bold mb-1">등록된 추천 방어덱이 없습니다.</p>
                  <p className="text-xs text-gray-500 mb-6">길드 관리자가 추천 덱을 등록할 수 있습니다.</p>

                  {isAdmin && (
                    <button
                      onClick={() => alert('추천 덱 등록 기능 (준비중)')}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold text-sm hover:bg-yellow-600 shadow-md transition"
                    >
                      + 추천 덱 등록하기
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* 푸터 */}
        <div className="p-4 border-t bg-white flex justify-between">
          {view === 'PICK' ? (
            <button onClick={() => setView('MENU')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm">← 이전 메뉴</button>
          ) : <div />}
          <button onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 text-sm">닫기</button>
        </div>
      </div>
    </div>
  );
}