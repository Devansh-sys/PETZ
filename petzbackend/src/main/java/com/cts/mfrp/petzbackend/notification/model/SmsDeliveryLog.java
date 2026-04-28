package com.cts.mfrp.petzbackend.notification.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-4.2.2 — audit trail for every SMS attempt.
 *
 * Written by SmsServiceStub (and later the real provider adapter).
 * Admin can query this table to debug delivery failures without
 * needing to parse application logs.
 */
@Entity
@Table(name = "sms_delivery_logs", indexes = {
        @Index(name = "idx_sms_phone_sent", columnList = "phone, sent_at DESC"),
        @Index(name = "idx_sms_status",     columnList = "status")
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmsDeliveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** E.164 / local-format phone — whatever was passed to sendSms(). */
    @Column(nullable = false, length = 30)
    private String phone;

    /** Full message text (may contain OTP — stored for audit in dev; redact in prod). */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private SmsStatus status;

    /** Provider name: "STUB", "MSG91", "TWILIO", etc. */
    @Column(length = 50)
    private String provider;

    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    /** Populated only when status = FAILED. */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @PrePersist
    void prePersist() {
        if (sentAt == null) sentAt = LocalDateTime.now();
    }

    public enum SmsStatus { SENT, FAILED }
}
