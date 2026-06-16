package com.store.domain.tenant;

public class User {
    private Long id;
    private String username;
    private String password;
    private String fullName;
    private UserRole role;
    private Long branchId;
    private boolean active;

    public User() {}

    public User(Long id, String username, String password, String fullName, UserRole role, Long branchId, boolean active) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.branchId = branchId;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
