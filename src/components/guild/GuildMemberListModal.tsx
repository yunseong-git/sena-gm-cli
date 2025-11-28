'use client';

import useSWR from 'swr';
import { apiClient } from '@/lib/apiClient';

export interface GuildMember {
  userId: string;
  nickname: string;
  tag: string;
  fullName?: string; // 백엔드에서 안오더라도 optional 처리
  role: string;      // 대소문자 유연하게 처리를 위해 string으로 변경
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// 역할별 뱃지 스타일 매핑 (키는 모두 대문자로 관리)
const ROLE_BADGE_STYLE: Record<string, string> = {
  MASTER: 'bg-red-100 text-red-700 border-red-200',
  SUBMASTER: 'bg-orange-100 text-orange-700 border-orange-200',
  MANAGER: 'bg-blue-100 text-blue-700 border-blue-200',
  MEMBER: 'bg-gray-100 text-gray-600 border-gray-200',
};

const ROLE_LABEL: Record<string, string> = {
  MASTER: '길드장',
  SUBMASTER: '부길드장',
  MANAGER: '관리자',
  MEMBER: '길드원',
};

export default function GuildMemberListModal({ isOpen, onClose }: Props) {
  const { data: members, error, isLoading } = useSWR<GuildMember[]>(
    isOpen ? '/guild/members' : null,
    async (url) => {
      const res = await apiClient(url);
      // [수정 포인트] 응답이 배열이면 바로 반환, 객체라면 payload 반환
      return Array.isArray(res) ? res : res.payload;
    },
    {
      revalidateOnFocus: false,
    }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* 헤더 */}
        <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">길드원 목록</h2>
            <p className="text-sm text-gray-500 mt-1">
              총 <span className="font-bold text-blue-600">{members?.length || 0}</span>명의 멤버가 있습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 리스트 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-48 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
              <span className="text-gray-500 text-sm">멤버 정보를 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-48 text-center">
              <span className="text-red-500 font-medium mb-2">오류가 발생했습니다</span>
              <p className="text-sm text-gray-500">잠시 후 다시 시도해주세요.</p>
            </div>
          ) : members && members.length > 0 ? (
            <ul className="space-y-3">
              {members.map((member) => {
                // [수정 포인트] role을 대문자로 변환하여 매핑 키로 사용
                const normalizedRole = member.role ? member.role.toUpperCase() : 'MEMBER';

                return (
                  <li
                    key={member.userId}
                    className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      {/* 프로필 아바타 (이름 첫 글자) */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${normalizedRole === 'MASTER' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {member.nickname.charAt(0)}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-lg">
                            {member.nickname}
                          </span>
                          <span className="text-gray-400 text-sm font-medium">
                            #{member.tag}
                          </span>
                        </div>

                        {/* 역할 뱃지 */}
                        <span className={`self-start text-[11px] px-2.5 py-0.5 rounded-full border font-semibold mt-1 ${ROLE_BADGE_STYLE[normalizedRole] || ROLE_BADGE_STYLE.MEMBER
                          }`}>
                          {ROLE_LABEL[normalizedRole] || member.role}
                        </span>
                      </div>
                    </div>

                    {/* 관리 버튼 (추후 기능 추가) */}
                    <button className="opacity-0 group-hover:opacity-100 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      관리
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">표시할 멤버가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition active:scale-[0.98]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}