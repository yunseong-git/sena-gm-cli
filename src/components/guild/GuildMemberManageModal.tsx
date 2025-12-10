'use client';

import { useSWRConfig } from 'swr';
import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/apiClient';
import { GuildMember } from './GuildMemberListModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  actorRole: string; // 나의 역할
  targetMember: GuildMember | null; // 관리 대상 멤버
}

// 관리 액션 타입 정의
type ActionType =
  | 'DELEGATE_MASTER'    // 길드장 위임
  | 'APPOINT_SUBMASTER'  // 부길드장 임명
  | 'DELEGATE_SUBMASTER' // 부길드장 위임 (로직상 APPOINT_SUBMASTER와 동일 API 사용)
  | 'APPOINT_MANAGER'    // 매니저 임명
  | 'DEMOTE_MANAGER'     // 매니저 해제
  | 'KICK';              // 추방

export default function GuildMemberManageModal({ isOpen, onClose, actorRole, targetMember }: Props) {
  const { setUser } = useUserStore();
  const { mutate } = useSWRConfig();

  if (!isOpen || !targetMember) return null;

  const actor = actorRole.toUpperCase();
  const target = targetMember.role.toUpperCase();

  // --- 버튼 노출 로직 (Matrix) ---
  const getActions = (): ActionType[] => {
    // 1. 내가 길드장(MASTER)인 경우
    if (actor === 'MASTER') {
      if (target === 'SUBMASTER') return ['DELEGATE_MASTER', 'KICK'];
      if (target === 'MANAGER') return ['APPOINT_SUBMASTER', 'DEMOTE_MANAGER', 'KICK'];
      if (target === 'MEMBER') return ['APPOINT_MANAGER', 'KICK'];
    }

    // 2. 내가 부길드장(SUBMASTER)인 경우
    if (actor === 'SUBMASTER') {
      if (target === 'MANAGER') return ['DELEGATE_SUBMASTER', 'DEMOTE_MANAGER', 'KICK'];
      if (target === 'MEMBER') return ['APPOINT_MANAGER', 'KICK'];
    }
    return [];
  };

  const actions = getActions();

  // API 호출 핸들러
  const handleAction = async (action: ActionType) => {
    const label = getActionLabel(action);
    if (!confirm(`'${targetMember.nickname}' 님에게 [${label}] 작업을 수행하시겠습니까?`)) return;

    try {
      const body = JSON.stringify({ targetId: targetMember.userId });
      let res;

      switch (action) {
        case 'DELEGATE_MASTER':
          // PATCH /guild/management/master
          res = await apiClient('/guild/management/master', { method: 'PATCH', body });
          break;

        case 'APPOINT_SUBMASTER':
        case 'DELEGATE_SUBMASTER':
          // PATCH /guild/management/submaster
          res = await apiClient('/guild/management/submaster', { method: 'PATCH', body });
          break;

        case 'APPOINT_MANAGER':
          // POST /guild/management/managers
          res = await apiClient('/guild/management/managers', { method: 'POST', body });
          break;

        case 'DEMOTE_MANAGER':
          // PATCH /guild/management/managers
          res = await apiClient('/guild/management/managers', { method: 'PATCH', body });
          break;

        case 'KICK':
          // PATCH /guild/management/kick
          res = await apiClient('/guild/management/kick', { method: 'PATCH', body });
          break;
      }

      alert('성공적으로 처리되었습니다.');

      // 1. 내 권한이 변경된 경우 (토큰 재발급) 상태 업데이트
      if (res && res.payload) {
        setUser(res.payload);
      }

      // 2. 길드원 목록 새로고침 (SWR cache invalidation)
      mutate('/guild/members');

      onClose();

    } catch (error: any) {
      console.error(error);
      alert(error.message || '작업 처리에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-20 animate-fade-in p-4">
      {/* 백그라운드 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-xl shadow-xl w-full max-w-xs overflow-hidden relative z-10 animate-scale-in border border-gray-100">
        {/* 헤더 */}
        <div className="bg-gray-50 p-4 border-b flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-2">
            {targetMember.nickname.charAt(0)}
          </div>
          <h3 className="font-bold text-gray-800 text-lg">{targetMember.nickname}</h3>
          <span className="text-xs text-gray-500">#{targetMember.tag} · {targetMember.role}</span>
        </div>

        {/* 액션 버튼 리스트 */}
        <div className="p-2 flex flex-col gap-1">
          {actions.length > 0 ? (
            actions.map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                className={`w-full py-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${getActionButtonStyle(action)}`}
              >
                {getActionLabel(action)}
              </button>
            ))
          ) : (
            <div className="py-4 text-center text-gray-400 text-sm">
              수행할 수 있는 작업이 없습니다.
            </div>
          )}
        </div>

        <div className="p-2 border-t">
          <button onClick={onClose} className="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium">
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 헬퍼 함수들 ---

function getActionLabel(action: ActionType): string {
  switch (action) {
    case 'DELEGATE_MASTER': return '길드장 위임';
    case 'APPOINT_SUBMASTER': return '부길드장 임명';
    case 'DELEGATE_SUBMASTER': return '부길드장 위임';
    case 'APPOINT_MANAGER': return '매니저 임명';
    case 'DEMOTE_MANAGER': return '매니저 해제';
    case 'KICK': return '길드 추방';
    default: return action;
  }
}

function getActionButtonStyle(action: ActionType): string {
  switch (action) {
    case 'KICK':
      return 'bg-red-50 text-red-600 hover:bg-red-100';
    case 'DELEGATE_MASTER':
    case 'DELEGATE_SUBMASTER':
    case 'APPOINT_SUBMASTER':
      return 'bg-purple-50 text-purple-700 hover:bg-purple-100';
    default:
      return 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100';
  }
}