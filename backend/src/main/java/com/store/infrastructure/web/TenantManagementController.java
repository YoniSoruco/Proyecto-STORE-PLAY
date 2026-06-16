package com.store.infrastructure.web;

import com.store.application.membership.TenantManagementService;
import com.store.application.membership.dto.TenantRequest;
import com.store.application.membership.dto.TenantResponse;
import com.store.application.security.SecurityContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tenants")
@CrossOrigin(origins = "*")
public class TenantManagementController {

    private final TenantManagementService tenantService;
    private final SecurityContextService securityContext;

    public TenantManagementController(TenantManagementService tenantService, SecurityContextService securityContext) {
        this.tenantService = tenantService;
        this.securityContext = securityContext;
    }

    @GetMapping
    public ResponseEntity<?> listTenants() {
        if (!securityContext.isSuperAdmin()) {
            return ResponseEntity.status(403).body("Solo el SuperAdmin puede gestionar negocios");
        }
        return ResponseEntity.ok(tenantService.listAllTenants());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTenant(@PathVariable String id, @RequestBody TenantRequest request) {
        if (!securityContext.isSuperAdmin()) {
            return ResponseEntity.status(403).body("Solo el SuperAdmin puede gestionar negocios");
        }
        return ResponseEntity.ok(tenantService.updateTenant(id, request));
    }

    @PatchMapping("/{id}/features")
    public ResponseEntity<?> updateFeatures(@PathVariable String id, @RequestBody List<String> features) {
        if (!securityContext.isSuperAdmin()) {
            return ResponseEntity.status(403).body("Solo el SuperAdmin puede gestionar negocios");
        }
        return ResponseEntity.ok(tenantService.updateTenantFeatures(id, features));
    }
}
