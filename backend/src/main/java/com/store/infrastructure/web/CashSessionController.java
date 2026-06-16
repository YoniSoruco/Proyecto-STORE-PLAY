package com.store.infrastructure.web;

import com.store.application.sale.CashSessionService;
import com.store.application.sale.dto.CashSessionResponse;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cash-sessions")
@CrossOrigin(origins = "*")
public class CashSessionController {

    private final CashSessionService sessionService;

    public CashSessionController(CashSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public List<CashSessionResponse> listSessions() {
        return sessionService.listSessions();
    }

    @GetMapping("/active/{userId}")
    public Optional<CashSessionResponse> getActiveSession(@PathVariable Long userId) {
        return sessionService.getActiveSession(userId);
    }

    @PostMapping("/open")
    public CashSessionResponse openSession(@RequestBody OpenSessionRequest request) {
        return sessionService.openSession(request.userId(), request.initialAmount());
    }

    @PostMapping("/close")
    public CashSessionResponse closeSession(@RequestBody CloseSessionRequest request) {
        return sessionService.closeSession(request.sessionId(), request.realAmount());
    }

    public record OpenSessionRequest(Long userId, BigDecimal initialAmount) {}
    public record CloseSessionRequest(Long sessionId, BigDecimal realAmount) {}
}
