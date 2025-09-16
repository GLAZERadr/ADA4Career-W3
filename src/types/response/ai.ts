export interface RoleMapResponse {
  ID: string;
  Email: string;
  Role: string;
  Level: string;
  Timeline: string;
  SkillsNeeded: string;
  ParentRole: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CourseRecommendation {
  courseName: string;
  level: string;
  description: string;
  source: string;
  url: string;
}

export interface RecommendationsResponse {
  recommendations: CourseRecommendation[];
}
