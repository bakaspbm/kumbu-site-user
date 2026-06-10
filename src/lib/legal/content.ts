export type LegalSection = { title: string; paragraphs: string[] };

export type ReportReasonId =
  | "spam"
  | "fraud"
  | "illegal"
  | "harassment"
  | "misleading"
  | "ip"
  | "other";

export type ContentReportTargetType = "product" | "user" | "message" | "review";

export const CONSENT_TYPES = {
  termsPrivacy: "terms_privacy_v1",
  publishRules: "publish_rules_v1",
} as const;
