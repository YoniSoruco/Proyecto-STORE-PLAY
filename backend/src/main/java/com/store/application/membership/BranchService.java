package com.store.application.membership;

import com.store.application.membership.dto.BranchRequest;
import com.store.application.membership.dto.BranchResponse;
import com.store.infrastructure.db.BranchEntity;
import com.store.infrastructure.db.SpringDataBranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BranchService {

    private final SpringDataBranchRepository branchRepository;

    public BranchService(SpringDataBranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    @Transactional(readOnly = true)
    public List<BranchResponse> listBranches() {
        return branchRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public BranchResponse createBranch(BranchRequest request) {
        BranchEntity branch = new BranchEntity();
        branch.setName(request.name());
        branch.setAddress(request.address());
        branch.setActive(request.active());
        return mapToResponse(branchRepository.save(branch));
    }

    @Transactional
    public BranchResponse updateBranch(Long id, BranchRequest request) {
        BranchEntity branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        branch.setName(request.name());
        branch.setAddress(request.address());
        branch.setActive(request.active());
        return mapToResponse(branchRepository.save(branch));
    }

    @Transactional
    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }

    private BranchResponse mapToResponse(BranchEntity entity) {
        return new BranchResponse(entity.getId(), entity.getName(), entity.getAddress(), entity.isActive());
    }
}
