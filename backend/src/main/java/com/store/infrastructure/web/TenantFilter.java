package com.store.infrastructure.web;

import com.store.domain.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class TenantFilter extends OncePerRequestFilter {

    private static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator") 
            || path.startsWith("/api/auth") 
            || path.startsWith("/api/public")
            || "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String tenantId = request.getHeader(TENANT_HEADER);
        if (tenantId == null || tenantId.trim().isEmpty()) {
            tenantId = request.getParameter("tenant");
        }

        // Si no hay tenantId pero la ruta es filtrada, usamos 'public' por defecto para evitar errores 400
        // en esta etapa de transición, o simplemente no seteamos el contexto.
        final String effectiveTenantId = (tenantId != null && !tenantId.trim().isEmpty()) ? tenantId : "public";

        TenantContext.runWithTenant(effectiveTenantId, () -> {
            try {
                filterChain.doFilter(request, response);
            } catch (IOException | ServletException e) {
                throw new RuntimeException(e);
            }
        });
    }
}
