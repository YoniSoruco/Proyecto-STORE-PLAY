package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataCategoryRepository extends JpaRepository<CategoryEntity, Long> {
}
