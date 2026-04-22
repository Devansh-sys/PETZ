package com.cts.mfrp.petzbackend.ngo.service;

import com.cts.mfrp.petzbackend.ngo.model.Ngo;

import java.util.UUID;

public interface NotificationService {
    void sendSirenAlert(Ngo ngo, double sosLat, double sosLon);
    void notifyOthersMissionClaimed(UUID missionId, UUID ngoId);
}
