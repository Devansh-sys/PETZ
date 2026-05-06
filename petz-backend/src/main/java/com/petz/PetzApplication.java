package com.petz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PetzApplication {
    public static void main(String[] args) {
        SpringApplication.run(PetzApplication.class, args);
    }
}
