/**
 * 알림 서비스 타입 정의
 */

import type { USaintSession } from '@rusaint/react-native';

/**
 * 알림 설정 인터페이스
 * 각 알림 종류별 활성화 여부를 저장
 */
export interface NotificationSettings {
  /** 채플 관련 알림 설정 */
  chapel: {
    /** 출석 정보 변경 알림 */
    attendance: boolean;
  };
  /** 전체 알림 활성화 여부 */
  enabled: boolean;
  /** 성적 관련 알림 설정 */
  grades: {
    /** 과목별 성적 변경 알림 */
    classGrade: boolean;
    /** 학기별 성적 업데이트 알림 */
    semesterGrade: boolean;
  };
}

/**
 * 기본 알림 설정
 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  grades: {
    classGrade: true,
    semesterGrade: true,
  },
  chapel: {
    attendance: true,
  },
};

/**
 * 알림 실행 시 전달되는 컨텍스트
 */
export interface NotificationContext {
  /** 현재 학기 정보 */
  currentSemester: {
    semester: number;
    year: number;
  };
  /** Rusaint 세션 */
  session: USaintSession;
  /** 학번 */
  studentId: string;
}

/**
 * 알림 콘텐츠 인터페이스
 */
export interface NotificationContent {
  /** 알림 본문 */
  body: string;
  /** 알림 데이터 (추가 정보) */
  data?: Record<string, unknown>;
  /** 알림 부제목 (iOS) */
  subtitle?: string;
  /** 알림 제목 */
  title: string;
}

/**
 * 알림 정의 옵션
 * @template TChange 변경 사항 타입
 */
export interface NotificationDefinitionOptions<TChange> {
  /**
   * 변경 사항 확인 함수
   * 데이터를 페칭하고 기존 데이터와 비교하여 변경 사항 배열 반환
   * 빈 배열 반환 시 알림 발송하지 않음
   */
  check: (ctx: NotificationContext) => Promise<TChange[]>;
  /** 알림 고유 키 */
  key: string;
  /**
   * 알림 콘텐츠 생성 함수
   * 각 변경 사항에 대해 호출되어 알림 콘텐츠 생성
   */
  notify: (change: TChange) => NotificationContent;
  /** 설정 경로 (예: 'grades.classGrade') */
  settingPath: string;
}

/**
 * 등록된 알림 핸들러 인터페이스
 */
export interface NotificationHandler {
  /** 변경 확인 및 알림 발송 함수 */
  execute: (ctx: NotificationContext) => Promise<NotificationContent[]>;
  /** 알림 고유 키 */
  key: string;
  /** 설정 경로 */
  settingPath: string;
}

/**
 * 과목별 성적 변경 정보
 */
export interface ClassGradeChange {
  /** 과목명 */
  className: string;
  /** 과목 코드 */
  code: string;
  /** 새 등급 */
  newRank: string;
  /** 이전 등급 */
  previousRank: null | string;
  /** 학기 */
  semester: number;
  /** 학년도 */
  year: number;
}

/**
 * 학기별 성적 변경 정보
 */
export interface SemesterGradeChange {
  /** 새 취득 학점 */
  newCredits: number;
  /** 새 평점 */
  newGpa: number;
  /** 이전 취득 학점 */
  previousCredits: null | number;
  /** 이전 평점 */
  previousGpa: null | number;
  /** 학기 */
  semester: number;
  /** 학년도 */
  year: number;
}

/**
 * 채플 출석 변경 정보
 */
export interface ChapelAttendanceChange {
  /** 출석 상태 */
  attendance: null | string;
  /** 변경 유형: 'attendance' | 'absence' */
  changeType: 'absence' | 'attendance';
  /** 날짜 */
  date: string;
  /** 학기 */
  semester: number;
  /** 학년도 */
  year: number;
}
