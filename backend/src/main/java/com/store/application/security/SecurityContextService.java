package com.store.application.security;

import com.store.domain.tenant.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class SecurityContextService {

    public Long getCurrentBranchId() {
        HttpServletRequest request = getCurrentRequest();
        if (request == null) return 1L;
        String branchId = request.getHeader("X-Branch-Id");
        return branchId != null ? Long.parseLong(branchId) : 1L;
    }

    public Long getCurrentUserId() {
        HttpServletRequest request = getCurrentRequest();
        if (request == null) return 2L;
        String userId = request.getHeader("X-User-Id");
        return userId != null ? Long.parseLong(userId) : 2L;
    }

    public UserRole getCurrentRole() {
        if (isSuperAdmin()) return UserRole.SUPERADMIN;
        
        HttpServletRequest request = getCurrentRequest();
        if (request == null) return UserRole.EMPLOYEE;
        
        String role = request.getHeader("X-User-Role");
        return role != null ? UserRole.valueOf(role) : UserRole.EMPLOYEE;
    }

    public boolean isSuperAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMIN"));
    }

    public boolean isOwner() {
        UserRole role = getCurrentRole();
        return UserRole.OWNER.equals(role) || UserRole.SUPERADMIN.equals(role);
    }

    public boolean isAdmin() {
        UserRole role = getCurrentRole();
        return UserRole.ADMIN.equals(role) || UserRole.OWNER.equals(role) || UserRole.SUPERADMIN.equals(role);
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null ? attrs.getRequest() : null;
    }
}
