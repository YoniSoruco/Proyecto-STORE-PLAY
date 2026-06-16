package com.store.application.membership;

import com.store.application.membership.dto.TenantRequest;
import com.store.application.membership.dto.TenantResponse;
import com.store.infrastructure.db.SpringDataTenantRepository;
import com.store.infrastructure.db.TenantEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TenantManagementService {

    private final SpringDataTenantRepository tenantRepository;

    public TenantManagementService(SpringDataTenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public List<TenantResponse> listAllTenants() {
        return tenantRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public TenantResponse updateTenantFeatures(String id, List<String> features) {
        TenantEntity tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));
        tenant.setFeatures(features);
        return mapToResponse(tenantRepository.save(tenant));
    }

    @Transactional
    public TenantResponse updateTenant(String id, TenantRequest request) {
        TenantEntity tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));
        tenant.setName(request.name());
        tenant.setVerticalType(request.verticalType());
        tenant.setPrimaryColor(request.primaryColor());
        tenant.setFeatures(request.features());
        tenant.setActive(request.active());
        return mapToResponse(tenantRepository.save(tenant));
    }

    private TenantResponse mapToResponse(TenantEntity entity) {
        return new TenantResponse(
                entity.getId(),
                entity.getName(),
                entity.getVerticalType(),
                entity.getPrimaryColor(),
                entity.getFeatures(),
                entity.isActive()
        );
    }
}
