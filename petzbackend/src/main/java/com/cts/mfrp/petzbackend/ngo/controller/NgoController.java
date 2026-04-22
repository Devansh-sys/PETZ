package com.cts.mfrp.petzbackend.ngo.controller;

import com.cts.mfrp.petzbackend.ngo.dto.AssignResponseDTO;
import com.cts.mfrp.petzbackend.ngo.dto.NavigationDTO;
import com.cts.mfrp.petzbackend.ngo.service.NgoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/ngo")
public class NgoController {

    @Autowired
    private NgoService ngoService;

    @PostMapping("/assign")
    public ResponseEntity<AssignResponseDTO> assignNgo(@RequestParam UUID sosReportId,
                                                       @RequestParam double sosLat,
                                                       @RequestParam double sosLon,
                                                       @RequestParam int severity) {
        return ResponseEntity.ok(ngoService.assignNearestNgo(sosReportId, sosLat, sosLon, severity));
    }

    @PostMapping("/missions/{missionId}/accept")
    public ResponseEntity<String> acceptMission(@PathVariable UUID missionId, @RequestParam UUID ngoId) {
        ngoService.acceptMission(missionId, ngoId);
        return ResponseEntity.ok("Mission accepted");
    }

    @PostMapping("/missions/{missionId}/decline")
    public ResponseEntity<String> declineMission(@PathVariable UUID missionId, @RequestParam UUID ngoId) {
        ngoService.declineMission(missionId, ngoId);
        return ResponseEntity.ok("Mission declined");
    }

    @GetMapping("/missions/{missionId}/navigation")
    public ResponseEntity<NavigationDTO> getNavigation(@PathVariable UUID missionId) {
        return ResponseEntity.ok(ngoService.getNavigationDetails(missionId));
    }
}
