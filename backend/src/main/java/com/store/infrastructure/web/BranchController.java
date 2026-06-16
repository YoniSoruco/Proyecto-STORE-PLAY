package com.store.infrastructure.web;

import com.store.application.membership.BranchService;
import com.store.application.membership.dto.BranchRequest;
import com.store.application.membership.dto.BranchResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@CrossOrigin(origins = "*")
public class BranchController {

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    @GetMapping
    public List<BranchResponse> listBranches() {
        return branchService.listBranches();
    }

    @PostMapping
    public BranchResponse createBranch(@RequestBody BranchRequest request) {
        return branchService.createBranch(request);
    }

    @PutMapping("/{id}")
    public BranchResponse updateBranch(@PathVariable Long id, @RequestBody BranchRequest request) {
        return branchService.updateBranch(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
    }
}
