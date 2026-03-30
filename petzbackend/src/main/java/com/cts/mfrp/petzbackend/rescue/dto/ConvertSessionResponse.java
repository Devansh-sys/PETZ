package com.cts.mfrp.petzbackend.rescue.dto;

import java.util.UUID;

public class ConvertSessionResponse {

    private UUID userId;
    private String phone;
    private String fullName;
    private String email;
    private String message;

    public ConvertSessionResponse(UUID userId, String phone,
                                  String fullName, String email, String message) {
        this.userId   = userId;
        this.phone    = phone;
        this.fullName = fullName;
        this.email    = email;
        this.message  = message;
    }

    public UUID getUserId()    { return userId; }
    public String getPhone()   { return phone; }
    public String getFullName(){ return fullName; }
    public String getEmail()   { return email; }
    public String getMessage() { return message; }
}


