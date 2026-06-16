package com.store.infrastructure.db;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_sessions")
public class CashSessionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "opened_at", nullable = false)
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "initial_amount", nullable = false)
    private BigDecimal initialAmount;

    @Column(name = "final_amount_expected")
    private BigDecimal finalAmountExpected;

    @Column(name = "final_amount_real")
    private BigDecimal finalAmountReal;

    @Column(name = "is_open", nullable = false)
    private boolean open;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDateTime getOpenedAt() { return openedAt; }
    public void setOpenedAt(LocalDateTime openedAt) { this.openedAt = openedAt; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }
    public BigDecimal getInitialAmount() { return initialAmount; }
    public void setInitialAmount(BigDecimal initialAmount) { this.initialAmount = initialAmount; }
    public BigDecimal getFinalAmountExpected() { return finalAmountExpected; }
    public void setFinalAmountExpected(BigDecimal finalAmountExpected) { this.finalAmountExpected = finalAmountExpected; }
    public BigDecimal getFinalAmountReal() { return finalAmountReal; }
    public void setFinalAmountReal(BigDecimal finalAmountReal) { this.finalAmountReal = finalAmountReal; }
    public boolean isOpen() { return open; }
    public void setOpen(boolean open) { this.open = open; }
}
