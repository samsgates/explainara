import type { Role } from "@explainara/shared";
export type SessionIdentity={userId:string;tenantId:string;email:string;roles:Role[]};
export class AuthorizationError extends Error{}
export function requireRole(session:SessionIdentity|undefined,allowed:Role[]){if(!session)throw new AuthorizationError("Authentication required");if(!session.roles.some(r=>allowed.includes(r)))throw new AuthorizationError("Insufficient permission");return session}
export function demoSession():SessionIdentity{return{userId:"demo-user",tenantId:"demo-org",email:"learner@explainara.local",roles:["student"]}}
export function assertTenant(session:SessionIdentity,tenantId:string){if(session.tenantId!==tenantId&&!session.roles.includes("platform_admin"))throw new AuthorizationError("Cross-tenant access denied")}
