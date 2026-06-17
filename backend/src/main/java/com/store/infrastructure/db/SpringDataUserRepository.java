package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SpringDataUserRepository extends JpaRepository<UserEntity, Long> {
    java.util.Optional<UserEntity> findByEmail(String email);
    java.util.Optional<UserEntity> findByResetToken(String resetToken);
}
