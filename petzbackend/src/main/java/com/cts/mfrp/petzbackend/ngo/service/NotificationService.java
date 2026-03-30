package com.cts.mfrp.petzbackend.ngo.service;

import com.cts.mfrp.petzbackend.ngo.model.Ngo;

public interface NotificationService {
    void sendSirenAlert(Ngo ngo, double sosLat, double sosLon);
    void notifyOthersMissionClaimed(Long missionId, Long ngoId);
}
