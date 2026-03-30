package com.cts.mfrp.petzbackend.ngo.repository;

import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface NgoRepository extends JpaRepository<Ngo, Long> {
    @Query("SELECT n FROM Ngo n WHERE n.active = true")
    List<Ngo> findActiveNgos();
}
