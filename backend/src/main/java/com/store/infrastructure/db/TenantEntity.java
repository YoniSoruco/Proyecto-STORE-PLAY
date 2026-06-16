package com.store.infrastructure.db;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "tenants", schema = "public")
public class TenantEntity {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "vertical_type")
    private String verticalType;

    @ElementCollection
    @CollectionTable(name = "tenant_features", joinColumns = @JoinColumn(name = "tenant_id"), schema = "public")
    @Column(name = "feature")
    private List<String> features;

    @Column(name = "primary_color")
    private String primaryColor;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getVerticalType() { return verticalType; }
    public void setVerticalType(String verticalType) { this.verticalType = verticalType; }
    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }
    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
