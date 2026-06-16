package com.store.application.sale;

import com.store.application.sale.dto.CashSessionResponse;
import com.store.application.security.SecurityContextService;
import com.store.infrastructure.db.CashSessionEntity;
import com.store.infrastructure.db.SpringDataCashSessionRepository;
import com.store.infrastructure.db.SpringDataSaleRepository;
import com.store.infrastructure.db.SaleEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CashSessionService {

    private final SpringDataCashSessionRepository sessionRepository;
    private final SpringDataSaleRepository saleRepository;
    private final SecurityContextService securityContext;

    public CashSessionService(SpringDataCashSessionRepository sessionRepository,
                               SpringDataSaleRepository saleRepository,
                               SecurityContextService securityContext) {
        this.sessionRepository = sessionRepository;
        this.saleRepository = saleRepository;
        this.securityContext = securityContext;
    }

    @Transactional(readOnly = true)
    public Optional<CashSessionResponse> getActiveSession(Long userId) {
        Long branchId = securityContext.getCurrentBranchId();
        return sessionRepository.findFirstByBranchIdAndUserIdAndOpenTrueOrderByOpenedAtDesc(branchId, userId)
                .map(this::mapToResponse);
    }

    @Transactional
    public CashSessionResponse openSession(Long userId, BigDecimal initialAmount) {
        Long branchId = securityContext.getCurrentBranchId();
        
        getActiveSession(userId).ifPresent(s -> {
            throw new RuntimeException("Ya tenés una sesión abierta en esta sucursal");
        });

        CashSessionEntity entity = new CashSessionEntity();
        entity.setBranchId(branchId);
        entity.setUserId(userId);
        entity.setInitialAmount(initialAmount);
        entity.setOpenedAt(LocalDateTime.now());
        entity.setOpen(true);

        return mapToResponse(sessionRepository.save(entity));
    }

    @Transactional
    public CashSessionResponse closeSession(Long sessionId, BigDecimal realAmount) {
        CashSessionEntity entity = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        if (!entity.isOpen()) {
            throw new RuntimeException("La sesión ya está cerrada");
        }

        // Calcular total esperado (Ventas en efectivo + Monto inicial)
        List<SaleEntity> sales = saleRepository.findByCashSessionId(sessionId);
        BigDecimal totalSales = sales.stream()
                .map(SaleEntity::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        entity.setFinalAmountExpected(entity.getInitialAmount().add(totalSales));
        entity.setFinalAmountReal(realAmount);
        entity.setClosedAt(LocalDateTime.now());
        entity.setOpen(false);

        return mapToResponse(sessionRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<CashSessionResponse> listSessions() {
        return sessionRepository.findAll().stream()
                .map(this::mapToResponse)
                .sorted((a, b) -> b.openedAt().compareTo(a.openedAt()))
                .toList();
    }

    private CashSessionResponse mapToResponse(CashSessionEntity entity) {
        return new CashSessionResponse(
                entity.getId(), entity.getBranchId(), entity.getUserId(),
                entity.getOpenedAt(), entity.getClosedAt(),
                entity.getInitialAmount(), entity.getFinalAmountExpected(),
                entity.getFinalAmountReal(), entity.isOpen()
        );
    }
}
