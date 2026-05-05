package com.cts.mfrp.petzbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // US-3.4.2: powers SlotLockSweeper that releases expired slot locks
public class PetzbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PetzbackendApplication.class, args);
	}

}

