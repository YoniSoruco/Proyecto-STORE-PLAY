package com.store.domain.tenant;

import java.util.List;

public class Tenant {
    private String id;
    private String name;
    private String verticalType;
    private List<String> features;
    private boolean active;

    public Tenant() {}

    public Tenant(String id, String name, String verticalType, List<String> features, boolean active) {
        this.id = id;
        this.name = name;
        this.verticalType = verticalType;
        this.features = features;
        this.active = active;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getVerticalType() { return verticalType; }
    public void setVerticalType(String verticalType) { this.verticalType = verticalType; }
    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
