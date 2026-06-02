package com.store.infrastructure.web;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/scan")
public class ScanController {

  private final Map<String, List<SseEmitter>> tenants = new ConcurrentHashMap<>();

  @PostMapping
  public ResponseEntity<Void> receive(
      @RequestBody ScanEvent event,
      @RequestHeader("X-Tenant-ID") String tenantId
  ) {
    var emitters = tenants.get(tenantId);
    if (emitters == null) return ResponseEntity.ok().build();

    var dead = new CopyOnWriteArrayList<SseEmitter>();
    emitters.forEach(emitter -> {
      try {
        emitter.send(SseEmitter.event()
            .name("scan")
            .data(event, MediaType.APPLICATION_JSON));
      } catch (IOException e) {
        dead.add(emitter);
      }
    });

    if (!dead.isEmpty()) {
      emitters.removeAll(dead);
      if (emitters.isEmpty()) tenants.remove(tenantId);
    }

    return ResponseEntity.ok().build();
  }

  @GetMapping("/stream")
  public SseEmitter stream(@RequestParam("tenant") String tenantId) {
    var emitter = new SseEmitter(Long.MAX_VALUE);
    var emitters = tenants.computeIfAbsent(tenantId, _k -> new CopyOnWriteArrayList<>());
    emitters.add(emitter);

    emitter.onCompletion(() -> remove(tenantId, emitter));
    emitter.onTimeout(() -> remove(tenantId, emitter));

    return emitter;
  }

  private void remove(String tenantId, SseEmitter emitter) {
    var emitters = tenants.get(tenantId);
    if (emitters == null) return;
    emitters.remove(emitter);
    if (emitters.isEmpty()) tenants.remove(tenantId);
  }
}
