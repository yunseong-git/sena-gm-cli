/**
 * ZustandStore
 * 전역으로 관리할 user와 isLoading 상태만 간단하게 정의 
 * */

import { create } from 'zustand';
import type { User } from '@/types/user.type';

interface UserState {
  user: User | null;
  isLoading: boolean; // 앱 로드 시 인증 상태 확인 중인지 여부
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true, // 기본값은 true (인증 상태 확인 전)

  setUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),
}));