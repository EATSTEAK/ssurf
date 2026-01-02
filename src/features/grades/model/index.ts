import { GradeSummaryEntity, SemesterGradeEntity } from '@/entities/grades/model';
import {
  GraduationRequirementEntity,
  GraduationRequirementsGeneralEntity,
  GraduationStudentEntity,
} from '@/entities/graduationRequirements/model';

export interface SemesterGradeTabView {
  data?: SemesterGradeEntity;
  semester: number;
  type: 'semester';
  year: number;
}

export interface GradeOverviewTabView {
  certificated: GradeSummaryEntity;
  recorded: GradeSummaryEntity;
  type: 'overview';
}

export type GradeTabView = GradeOverviewTabView | SemesterGradeTabView;

export type GradeTabSelection =
  | {
      semester: number;
      type: 'semester';
      year: number;
    }
  | {
      type: 'overview';
    };

export interface GraduationView {
  general: GraduationRequirementsGeneralEntity;
  requirements: GraduationRequirementEntity[];
  student: GraduationStudentEntity;
}
