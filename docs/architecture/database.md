# Modelo de Dados

Ver `packages/database/prisma/schema.prisma` para o schema completo.
Entidades principais: User, Session, MFAFactor, GitHubAccount,
GitHubInstallation, Repository, Project, ProjectEnvironment,
Deployment (+ Log/Artifact/Version/Event), InfrastructureProvider,
Server (+ Allocation/HealthCheck), Domain (+ Verification/Certificate),
Plan, Subscription, Invoice, Wallet, WalletTransaction, CreditGrant,
Payment, Notification, AuditLog, Incident, SupportTicket,
WebhookEvent, IdempotencyKey, UsageMeter, AdminRole/AdminRoleAssignment.
