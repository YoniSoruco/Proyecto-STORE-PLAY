package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataProductRepository extends JpaRepository<ProductEntity, Long> {
}
