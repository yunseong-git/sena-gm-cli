'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialNotice: string;
  initialTag: string;
  onUpdate: () => void;
}

type ViewState = 'MENU' | 'EDIT_INFO' | 'EDIT_PERM' | 'INVITE' | 'COMM';

export default function GuildManageModal({ isOpen, onClose, initialNotice, initialTag, onUpdate }: Props) {
  const [view, setView] = useState<ViewState>('MENU');

  // --- 상태 관리 ---
  const [notice, setNotice] = useState(initialNotice);
  const [tag, setTag] = useState(initialTag);
  const [isTagChecked, setIsTagChecked] = useState(false);
  const [isTagAvailable, setIsTagAvailable] = useState(false);

  // 초대 코드 상태
  const [inviteCode, setInviteCode] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setView('MENU');
      setNotice(initialNotice);
      setTag(initialTag);
      setIsTagChecked(true);
      setIsTagAvailable(true);
      setInviteCode('');
      setIsCopied(false);
    }
  }, [isOpen, initialNotice, initialTag]);

  // --- API 핸들러 ---

  // 1. 공지사항 수정
  const handleUpdateNotice = async () => {
    try {
      await apiClient('/guild/management/notice', {
        method: 'PATCH',
        body: JSON.stringify({ notice }),
      });
      alert('공지사항이 수정되었습니다.');
      onUpdate();
    } catch (error: any) {
      alert(error.message || '공지사항 수정 실패');
    }
  };

  // 2. 태그 중복 확인
  const handleCheckTag = async () => {
    if (!tag || tag.length < 1 || tag.length > 8) {
      alert('태그는 1~8자여야 합니다.');
      return;
    }
    try {
      await apiClient('/guild/management/check-tag', {
        method: 'POST',
        body: JSON.stringify({ tag }),
      });
      setIsTagChecked(true);
      setIsTagAvailable(true);
      alert('사용 가능한 태그입니다.');
    } catch (error: any) {
      setIsTagChecked(true);
      setIsTagAvailable(false);
      alert(error.message || '사용 불가한 태그입니다.');
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
      onUpdate();
    } catch (error: any) {
      alert(error.message || '태그 변경 실패');
    }
  };

  // 4. 초대 코드 가져오기
  const fetchInviteCode = async () => {
    try {
      // GET /guild/management/code
      const res = await apiClient('/guild/management/code');
      if (res.code) {
        setInviteCode(res.code);
      }
    } catch (error) {
      console.error('초대 코드 로드 실패', error);
    }
  };

  // 5. [New] 초대 코드 재생성 (PATCH)
  const handleRegenerateCode = async () => {
    if (!confirm('초대 코드를 재발급하시겠습니까?\n기존 코드는 더 이상 사용할 수 없습니다.')) return;

    try {
      const res = await apiClient('/guild/management/code', {
        method: 'PATCH',
      });
      if (res.code) {
        setInviteCode(res.code);
        alert('새로운 코드가 발급되었습니다.');
      }
    } catch (error: any) {
      alert(error.message || '코드 재발급 실패');
    }
  };

  // 6. 링크 복사
  const handleCopyInviteLink = () => {
    if (!inviteCode) return;
    const url = `${window.location.origin}/guild/join?code=${inviteCode}`;

    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // 뷰 진입 시 코드 로드
  useEffect(() => {
    if (view === 'INVITE' && !inviteCode) {
      fetchInviteCode();
    }
  }, [view, inviteCode]);

  // 태그 인풋 변경 처리
  const handleChangeTag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTag(val);
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
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {view === 'MENU' && '⚙️ 길드 관리'}
            {view === 'EDIT_INFO' && '📝 정보 수정'}
            {view === 'INVITE' && '📩 길드 초대'}
            {view === 'EDIT_PERM' && '🛡️ 권한 관리'}
            {view === 'COMM' && '📢 관리자 소통'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">

          {/* 1. 메인 메뉴 */}
          {view === 'MENU' && (
            <div className="grid grid-cols-2 gap-4">
              <MenuButton icon="📝" title="정보 수정" desc="공지사항 및 태그" onClick={() => setView('EDIT_INFO')} />
              <MenuButton icon="📩" title="길드 초대" desc="초대 링크 생성" onClick={() => setView('INVITE')} />
              <MenuButton icon="🛡️" title="권한 관리" desc="직책 및 권한" onClick={() => alert('준비 중입니다.')} />
              <MenuButton icon="📢" title="관리자 소통" desc="운영진 채널" onClick={() => alert('준비 중입니다.')} />
            </div>
          )}

          {/* 2. 정보 수정 */}
          {view === 'EDIT_INFO' && (
            <div className="space-y-6">
              {/* 공지사항 */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">📢 공지사항 수정</h3>
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32 text-sm"
                  placeholder="공지사항 입력 (최대 200자)"
                  maxLength={200}
                  value={notice}
                  onChange={(e) => setNotice(e.target.value)}
                />
                <div className="flex justify-end mt-3">
                  <button onClick={handleUpdateNotice} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">저장</button>
                </div>
              </div>

              {/* 태그 */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">🏷️ 길드 태그 변경</h3>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    value={tag}
                    onChange={handleChangeTag}
                    maxLength={8}
                  />
                  <button
                    onClick={handleCheckTag}
                    disabled={tag === initialTag}
                    className={`px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${tag === initialTag ? 'bg-gray-100 text-gray-400' :
                        isTagChecked && isTagAvailable ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}
                  >
                    {tag === initialTag ? '사용중' : isTagChecked && isTagAvailable ? '확인완료' : '중복확인'}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleUpdateTag}
                    disabled={!isTagChecked || !isTagAvailable || tag === initialTag}
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${(!isTagChecked || !isTagAvailable || tag === initialTag) ? 'bg-gray-200 text-gray-400' : 'bg-purple-600 text-white'
                      }`}
                  >
                    변경
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. 초대 관리 (업데이트됨) */}
          {view === 'INVITE' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                  📩
                </div>
                <h3 className="text-lg font-bold text-gray-800">길드원 초대하기</h3>
                <p className="text-sm text-gray-500 mt-1">
                  아래 링크를 복사하여 공유하세요.
                </p>
              </div>

              <div className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <label className="text-xs font-bold text-gray-400 mb-1 block">초대 링크</label>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    readOnly
                    value={inviteCode ? `${window.location.origin}/guild/join?code=${inviteCode}` : '코드 불러오는 중...'}
                    className="bg-transparent flex-1 text-sm text-gray-600 outline-none font-mono"
                  />
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleRegenerateCode}
                    className="px-4 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg font-bold text-sm transition"
                  >
                    재발급
                  </button>
                  <button
                    onClick={handleCopyInviteLink}
                    disabled={!inviteCode}
                    className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${isCopied ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                  >
                    {isCopied ? '복사 완료!' : '링크 복사'}
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-400 text-center px-4 leading-relaxed">
                * 초대 코드가 유출되었거나 변경이 필요한 경우 <b>[재발급]</b>을 눌러주세요.<br />
                * 재발급 시 기존 코드는 즉시 만료되어 사용할 수 없습니다.
              </div>
            </div>
          )}

        </div>

        {/* 푸터 */}
        <div className="p-4 border-t bg-white flex justify-between">
          {view !== 'MENU' ? (
            <button onClick={() => setView('MENU')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">← 이전 메뉴</button>
          ) : <div />}
          <button onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">닫기</button>
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, title, desc, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition group bg-white shadow-sm">
      <div className="text-3xl mb-2 group-hover:scale-110 transition">{icon}</div>
      <span className="font-bold text-gray-800">{title}</span>
      <span className="text-xs text-gray-400 mt-1">{desc}</span>
    </button>
  )
}