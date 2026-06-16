package com.store.infrastructure.db;

import com.store.domain.tenant.UserRole;
import jakarta.persistence.*;

@Entity
@Table(name = "memberships", schema = "public")
public class MembershipEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "branch_id")
    private Long branchId;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
