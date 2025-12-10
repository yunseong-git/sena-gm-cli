'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { apiClient } from '@/lib/apiClient';
import { useUserStore } from '@/store/useUserStore';
import GuildMemberManageModal from './GuildMemberManageModal';

export interface GuildMember {
  userId: string;
  nickname: string;
  tag: string;
  fullName?: string;
  role: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_BADGE_STYLE: Record<string, string> = {
  MASTER: 'bg-red-100 text-red-700 border-red-200',
  SUBMASTER: 'bg-orange-100 text-orange-700 border-orange-200',
  MANAGER: 'bg-blue-100 text-blue-700 border-blue-200',
  MEMBER: 'bg-gray-100 text-gray-600 border-gray-200',
};

const ROLE_LABEL: Record<string, string> = {
  MASTER: '길드장',
  SUBMASTER: '부길드장',
  MANAGER: '매니저',
  MEMBER: '길드원',
};

export default function GuildMemberListModal({ isOpen, onClose }: Props) {
  const { user, setUser } = useUserStore();
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);

  const { data: members, error, isLoading } = useSWR<GuildMember[]>(
    isOpen ? '/guild/members' : null,
    async (url) => {
      const res = await apiClient(url);
      return Array.isArray(res) ? res : res.payload;
    },
    { revalidateOnFocus: false }
  );

  // 내 역할 및 권한 확인
  const myRole = user?.guildRole?.toUpperCase() || 'MEMBER';
  const canManage = ['MASTER', 'SUBMASTER'].includes(myRole);

  // 길드 해산 가능 여부 (마스터이고 멤버가 1명뿐일 때)
  const canDismiss = myRole === 'MASTER' && members && members.length === 1;

  // 1. 길드 탈퇴
  const handleLeaveGuild = async () => {
    if (!confirm('정말 길드를 탈퇴하시겠습니까?\n탈퇴 후 재가입 시 초대 코드가 필요할 수 있습니다.')) return;

    try {
      const res = await apiClient('/guild/leave', { method: 'PATCH' });
      alert('길드를 탈퇴했습니다.');
      if (res.payload) setUser(res.payload); // 길드 없음 상태로 갱신
      onClose();
    } catch (error: any) {
      alert(error.message || '탈퇴 실패');
    }
  };

  // 2. 길드 해산
  const handleDismissGuild = async () => {
    if (!confirm('정말 길드를 해산하시겠습니까?\n이 작업은 되돌릴 수 없으며 모든 데이터가 삭제됩니다.')) return;

    try {
      const res = await apiClient('/guild', { method: 'DELETE' });
      alert('길드가 해산되었습니다.');
      if (res.payload) setUser(res.payload); // 길드 없음 상태로 갱신
      onClose();
    } catch (error: any) {
      alert(error.message || '해산 실패');
    }
  };

  if (!isOpen) return null;

  return (
    <>
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
                  const normalizedRole = member.role ? member.role.toUpperCase() : 'MEMBER';
                  const isMe = member.userId === user?.sub; // user._id 확인 필요 (백엔드 Payload 기준)

                  return (
                    <li
                      key={member.userId}
                      className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${normalizedRole === 'MASTER' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                          {member.nickname.charAt(0)}
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-lg">
                              {member.nickname} {isMe && <span className="text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded ml-1">나</span>}
                            </span>
                            <span className="text-gray-400 text-sm font-medium">
                              #{member.tag}
                            </span>
                          </div>

                          <span className={`self-start text-[11px] px-2.5 py-0.5 rounded-full border font-semibold mt-1 ${ROLE_BADGE_STYLE[normalizedRole] || ROLE_BADGE_STYLE.MEMBER
                            }`}>
                            {ROLE_LABEL[normalizedRole] || member.role}
                          </span>
                        </div>
                      </div>

                      {/* 관리 버튼: 내 권한(Master/Sub)이 있고, 대상이 내가 아닐 때 */}
                      {canManage && !isMe && (
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="opacity-0 group-hover:opacity-100 px-3 py-1.5 text-sm font-bold text-gray-500 hover:text-white hover:bg-gray-800 bg-gray-100 rounded-lg transition-all"
                        >
                          관리
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-10 text-gray-500">표시할 멤버가 없습니다.</div>
            )}
          </div>

          {/* 푸터 (탈퇴 / 해산 버튼) */}
          <div className="p-4 border-t bg-white flex flex-col gap-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition"
            >
              닫기
            </button>

            {/* 1. 길드 탈퇴 (마스터가 아닌 경우) */}
            {myRole !== 'MASTER' && (
              <button
                onClick={handleLeaveGuild}
                className="w-full py-2 text-xs text-gray-400 hover:text-red-500 underline transition"
              >
                길드 탈퇴하기
              </button>
            )}

            {/* 2. 길드 해산 (마스터이고 혼자 남았을 때) */}
            {canDismiss && (
              <button
                onClick={handleDismissGuild}
                className="w-full py-2 text-xs text-red-500 hover:text-red-700 underline transition font-bold"
              >
                ⛔ 길드 해산하기 (복구 불가)
              </button>
            )}
          </div>
        </div>
      </div>

      <GuildMemberManageModal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        actorRole={myRole}
        targetMember={selectedMember}
      />
    </>
  );
}