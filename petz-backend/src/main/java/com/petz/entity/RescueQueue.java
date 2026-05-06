package com.petz.entity;

import com.petz.enums.QueueResponse;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_queue")
@Data
@NoArgsConstructor
public class RescueQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rescue_id", nullable = false, unique = true)
    private Long rescueId;

    @Column(name = "ngo_id", nullable = false)
    private Long ngoId;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private QueueResponse response = QueueResponse.PENDING;
}
