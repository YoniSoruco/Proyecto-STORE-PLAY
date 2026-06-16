package com.store.infrastructure.web;

import com.store.application.security.AuthService;
import com.store.application.security.dto.LoginResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            System.out.println("AuthController: Intento de login para email: " + request.email());
            return ResponseEntity.ok(authService.login(request.email(), request.password()));
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(401).body(new ErrorResponse("Email o contraseña incorrectos"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Error interno del servidor"));
        }
    }

    public record LoginRequest(String email, String password) {}
    private record ErrorResponse(String message) {}
}
