'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // 초기 데이터 (수정 시 현재 값을 보여주기 위함)
  initialNotice: string;
  initialTag: string;
  // 수정 완료 시 부모 페이지 데이터를 갱신하기 위한 콜백
  onUpdate: () => void;
}

// 화면 상태 타입 정의
type ViewState = 'MENU' | 'EDIT_INFO' | 'EDIT_PERM' | 'INVITE' | 'COMM';

export default function GuildManageModal({ isOpen, onClose, initialNotice, initialTag, onUpdate }: Props) {
  const [view, setView] = useState<ViewState>('MENU');

  // --- 상태 관리 ---
  // 공지사항
  const [notice, setNotice] = useState(initialNotice);
  // 태그
  const [tag, setTag] = useState(initialTag);
  const [isTagChecked, setIsTagChecked] = useState(false); // 중복확인 완료 여부
  const [isTagAvailable, setIsTagAvailable] = useState(false); // 사용 가능 여부

  // 모달이 열릴 때 초기값 세팅 & 뷰 초기화
  useEffect(() => {
    if (isOpen) {
      setView('MENU');
      setNotice(initialNotice);
      setTag(initialTag);
      setIsTagChecked(true); // 현재 내 태그는 이미 검증된 것
      setIsTagAvailable(true);
    }
  }, [isOpen, initialNotice, initialTag]);

  // --- 핸들러 ---

  // 1. 공지사항 수정
  const handleUpdateNotice = async () => {
    try {
      await apiClient('/guild/management/notice', {
        method: 'PATCH',
        body: JSON.stringify({ notice }),
      });
      alert('공지사항이 수정되었습니다.');
      onUpdate(); // 부모 데이터 갱신
    } catch (error: any) {
      alert(error.message || '공지사항 수정 실패');
    }
  };

  // 2. 태그 중복 확인
  const handleCheckTag = async () => {
    if (!tag || tag.length < 1 || tag.length > 8) {
      alert('태그는 1~8자로 입력해주세요.');
      return;
    }
    // 정규식 검사 (특수문자 제외)
    if (!/^[가-힣a-zA-Z0-9]+$/.test(tag)) {
        alert('특수문자는 사용할 수 없습니다.');
        return;
    }

    try {
      await apiClient('/guild/management/check-tag', {
        method: 'POST',
        body: JSON.stringify({ tag }),
      });
      // 에러가 안나면 사용 가능 (201 Created or 200 OK)
      setIsTagChecked(true);
      setIsTagAvailable(true);
      alert('사용 가능한 태그입니다.');
    } catch (error: any) {
      setIsTagChecked(true);
      setIsTagAvailable(false);
      alert(error.message || '이미 사용 중인 태그입니다.');
    }
  };

  // 3. 태그 수정 제출
  const handleUpdateTag = async () => {
    if (!isTagChecked || !isTagAvailable) return;

    try {
      await apiClient('/guild/management/tag', {
        method: 'PATCH',
        body: JSON.stringify({ tag }),
      });
      alert('길드 태그가 변경되었습니다.');
      onUpdate(); // 부모 데이터 갱신
    } catch (error: any) {
      alert(error.message || '태그 변경 실패');
    }
  };

  // 태그 인풋 변경 시 중복확인 상태 초기화
  const handleChangeTag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTag(val);
    // 내 원래 태그랑 같으면 확인 필요 없음
    if (val === initialTag) {
        setIsTagChecked(true);
        setIsTagAvailable(true);
    } else {
        setIsTagChecked(false);
        setIsTagAvailable(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* 헤더 */}
        <div className="p-5 border-b flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {view === 'MENU' && '⚙️ 길드 관리'}
            {view === 'EDIT_INFO' && '📝 정보 수정'}
            {view === 'EDIT_PERM' && '🛡️ 권한 관리'}
            {view === 'INVITE' && '📩 길드 초대'}
            {view === 'COMM' && '📢 관리자 소통'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          
          {/* 1. 메인 메뉴 뷰 */}
          {view === 'MENU' && (
            <div className="grid grid-cols-2 gap-4">
              <MenuButton 
                icon="📝" title="정보 수정" desc="공지사항 및 태그 변경" 
                onClick={() => setView('EDIT_INFO')} 
              />
              <MenuButton 
                icon="🛡️" title="권한 관리" desc="직책 및 권한 설정" 
                onClick={() => alert('준비 중입니다.')} 
              />
              <MenuButton 
                icon="📩" title="길드 초대" desc="초대 링크 생성" 
                onClick={() => alert('준비 중입니다.')} 
              />
              <MenuButton 
                icon="📢" title="관리자 소통" desc="운영진 전용 채널" 
                onClick={() => alert('준비 중입니다.')} 
              />
            </div>
          )}

          {/* 2. 정보 수정 뷰 */}
          {view === 'EDIT_INFO' && (
            <div className="space-y-8">
              
              {/* 공지사항 수정 섹션 */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  📢 공지사항 수정
                </h3>
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32 text-sm"
                  placeholder="길드 공지사항을 입력하세요 (최대 200자)"
                  maxLength={200}
                  value={notice}
                  onChange={(e) => setNotice(e.target.value)}
                />
                <div className="flex justify-end mt-3">
                  <button 
                    onClick={handleUpdateNotice}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                  >
                    공지 저장
                  </button>
                </div>
              </div>

              {/* 태그 수정 섹션 */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  🏷️ 길드 태그 변경
                </h3>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    placeholder="새 태그 (1~8자, 특수문자 X)"
                    value={tag}
                    onChange={handleChangeTag}
                    maxLength={8}
                  />
                  <button 
                    onClick={handleCheckTag}
                    disabled={tag === initialTag} // 기존 태그면 확인 불필요
                    className={`px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                        tag === initialTag 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isTagChecked && isTagAvailable 
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {tag === initialTag ? '사용중' : isTagChecked && isTagAvailable ? '확인완료' : '중복확인'}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mb-4">
                  * 태그 변경 시 중복 확인이 필요합니다.
                </p>

                <div className="flex justify-end">
                  <button 
                    onClick={handleUpdateTag}
                    disabled={!isTagChecked || !isTagAvailable || tag === initialTag}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                        (!isTagChecked || !isTagAvailable || tag === initialTag)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    태그 변경
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* 푸터: 뒤로가기 / 닫기 */}
        <div className="p-4 border-t bg-white flex justify-between">
          {view !== 'MENU' ? (
            <button 
              onClick={() => setView('MENU')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              ← 이전 메뉴
            </button>
          ) : (
            <div /> /* 레이아웃 유지용 빈칸 */
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// 메뉴 버튼 컴포넌트
function MenuButton({ icon, title, desc, onClick }: { icon: string, title: string, desc: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition group bg-white shadow-sm"
        >
            <div className="text-3xl mb-2 group-hover:scale-110 transition">{icon}</div>
            <span className="font-bold text-gray-800">{title}</span>
            <span className="text-xs text-gray-400 mt-1">{desc}</span>
        </button>
    )
}