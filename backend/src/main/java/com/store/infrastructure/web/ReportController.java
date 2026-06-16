package com.store.infrastructure.web;

import com.store.application.sale.ReportService;
import com.store.application.sale.dto.ProfitabilityReportResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/profitability")
    public ResponseEntity<ProfitabilityReportResponse> getProfitabilityReport() {
        return ResponseEntity.ok(reportService.getProfitabilityReport());
    }
}
