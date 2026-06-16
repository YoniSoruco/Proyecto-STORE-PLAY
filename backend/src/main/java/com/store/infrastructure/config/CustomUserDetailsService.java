package com.store.infrastructure.config;

import com.store.infrastructure.db.SpringDataUserRepository;
import com.store.infrastructure.db.UserEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final SpringDataUserRepository userRepository;

    public CustomUserDetailsService(SpringDataUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        List<SimpleGrantedAuthority> authorities = user.isSystemAdmin() 
            ? Collections.singletonList(new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"))
            : Collections.emptyList();

        return new org.springframework.security.core.userdetails.User(
            user.getEmail(), 
            user.getPassword(), 
            authorities
        );
    }
}
