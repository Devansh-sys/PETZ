package com.cts.mfrp.petzbackend.ngo.controller;

import com.cts.mfrp.petzbackend.ngo.dto.NavigationDTO;
import com.cts.mfrp.petzbackend.ngo.dto.NgoResponseDTO;
import com.cts.mfrp.petzbackend.ngo.service.NgoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ngo")
public class NgoController {

    @Autowired
    private NgoService ngoService;

    @PostMapping("/assign")
    public ResponseEntity<List<NgoResponseDTO>> assignNgo(@RequestParam double sosLat,
                                                          @RequestParam double sosLon,
                                                          @RequestParam int severity) {
        return ResponseEntity.ok(ngoService.assignNearestNgo(sosLat, sosLon, severity));
    }

    @PostMapping("/missions/{missionId}/accept")
    public ResponseEntity<String> acceptMission(@PathVariable Long missionId, @RequestParam Long ngoId) {
        ngoService.acceptMission(missionId, ngoId);
        return ResponseEntity.ok("Mission accepted");
    }

    @PostMapping("/missions/{missionId}/decline")
    public ResponseEntity<String> declineMission(@PathVariable Long missionId, @RequestParam Long ngoId) {
        ngoService.declineMission(missionId, ngoId);
        return ResponseEntity.ok("Mission declined");
    }

    @GetMapping("/missions/{missionId}/navigation")
    public ResponseEntity<NavigationDTO> getNavigation(@PathVariable Long missionId) {
        return ResponseEntity.ok(ngoService.getNavigationDetails(missionId));
    }
}
