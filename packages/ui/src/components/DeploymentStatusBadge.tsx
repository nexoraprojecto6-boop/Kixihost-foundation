import type React from "react";

export type DeploymentStatusBadgeStatus =
  | "QUEUED"
  | "BUILDING"
  | "BUILT"
  | "DEPLOYING"
  | "HEALTH_CHECK"
  | "ACTIVE"
  | "FAILED"
  | "ROLLED_BACK"
  | "CANCELLED";

const STATUS_COLORS: Record<DeploymentStatusBadgeStatus, string> = {
  QUEUED: "#94a3b8",
  BUILDING: "#f59e0b",
  BUILT: "#f59e0b",
  DEPLOYING: "#3b82f6",
  HEALTH_CHECK: "#3b82f6",
  ACTIVE: "#22c55e",
  FAILED: "#ef4444",
  ROLLED_BACK: "#a855f7",
  CANCELLED: "#64748b",
};

export interface DeploymentStatusBadgeProps {
  status: DeploymentStatusBadgeStatus;
  label: string;
}

// Componente reutilizável partilhado entre apps/web e apps/admin.
export function DeploymentStatusBadge({ status, label }: DeploymentStatusBadgeProps): React.ReactElement {
  return (
    <span
      style={{
        backgroundColor: STATUS_COLORS[status],
        color: "#fff",
        borderRadius: "9999px",
        padding: "2px 10px",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
