package com.store.domain.product;

public class Supplier {
    private Long id;
    private String name;
    private String address;
    private String phoneNumber;
    private boolean active;

    public Supplier() {}

    public Supplier(Long id, String name, String address, String phoneNumber, boolean active) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
