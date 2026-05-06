package com.petz.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String profilePhoto;
    private String address;
    private String city;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
