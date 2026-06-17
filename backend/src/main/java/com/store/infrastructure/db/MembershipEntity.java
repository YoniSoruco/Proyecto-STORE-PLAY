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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "membership_branches", joinColumns = @JoinColumn(name = "membership_id"), schema = "public")
    @Column(name = "branch_id")
    private java.util.Set<Long> branchIds = new java.util.HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "membership_features", joinColumns = @JoinColumn(name = "membership_id"), schema = "public")
    @Column(name = "feature")
    private java.util.Set<String> features = new java.util.HashSet<>();

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
    public java.util.Set<Long> getBranchIds() { return branchIds; }
    public void setBranchIds(java.util.Set<Long> branchIds) { this.branchIds = branchIds; }
    public java.util.Set<String> getFeatures() { return features; }
    public void setFeatures(java.util.Set<String> features) { this.features = features; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
