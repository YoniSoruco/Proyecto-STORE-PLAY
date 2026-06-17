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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String token = authService.requestPasswordReset(request.email());
            // En producción no devolvemos el token, solo un mensaje de éxito.
            // Por ahora, para testing, lo devolvemos en un campo 'debugToken'.
            return ResponseEntity.ok(new MessageResponse("Si el email existe, se enviarán instrucciones de recuperación.", token));
        } catch (Exception e) {
            // No revelamos si el usuario existe o no por seguridad
            return ResponseEntity.ok(new MessageResponse("Si el email existe, se enviarán instrucciones de recuperación.", null));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.token(), request.newPassword());
            return ResponseEntity.ok(new MessageResponse("Contraseña actualizada con éxito", null));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(new ErrorResponse(e.getMessage()));
        }
    }

    public record LoginRequest(String email, String password) {}
    public record ForgotPasswordRequest(String email) {}
    public record ResetPasswordRequest(String token, String newPassword) {}
    private record MessageResponse(String message, String debugToken) {}
    private record ErrorResponse(String message) {}
}
