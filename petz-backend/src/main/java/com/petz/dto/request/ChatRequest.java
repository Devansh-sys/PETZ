package com.petz.dto.request;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ChatRequest {
    private String message;
    private List<Map<String, String>> history; // [{role: "user", content: "..."}, ...]

    // User context — sent from frontend for personalization & role-aware tool calling
    private Long   userId;
    private String role;
    private String userName;
    private String userEmail;
}
