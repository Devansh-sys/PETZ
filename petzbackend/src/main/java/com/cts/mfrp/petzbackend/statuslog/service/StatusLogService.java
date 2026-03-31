package com.cts.mfrp.petzbackend.statuslog.service;

import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import com.cts.mfrp.petzbackend.statuslog.model.StatusLog;
import com.cts.mfrp.petzbackend.statuslog.repository.StatusLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatusLogService {

    private final StatusLogRepository statusLogRepository;

    public void logStatusChange(SosReport report, String status) {
        StatusLog log = StatusLog.builder()
                .sosReport(report)
                .status(status)
                .build();
        statusLogRepository.save(log);
    }
}