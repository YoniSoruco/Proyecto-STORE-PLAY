package com.store.infrastructure.web;

import com.store.application.membership.MembershipService;
import com.store.application.membership.dto.MemberRequest;
import com.store.application.membership.dto.MemberResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MembershipController {

    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping
    public List<MemberResponse> listMembers() {
        return membershipService.listMembers();
    }

    @PostMapping
    public MemberResponse addMember(@RequestBody MemberRequest request) {
        return membershipService.addMember(request);
    }

    @PutMapping("/{id}")
    public MemberResponse updateMember(@PathVariable Long id, @RequestBody MemberRequest request) {
        return membershipService.updateMember(id, request);
    }

    @DeleteMapping("/{id}")
    public void removeMember(@PathVariable Long id) {
        membershipService.removeMember(id);
    }
}
