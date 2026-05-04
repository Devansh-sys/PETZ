package com.cts.mfrp.petzbackend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashVerifyTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Petz@1234";
        String storedHash = "$2a$10$iZ66MMBo2Alar57KhMsO/eBaWhszab3HC/CrYxeAbeGAo3m5X4MJC";

        System.out.println("Password: " + password);
        System.out.println("Password length: " + password.length());
        System.out.println("Password bytes: " + java.util.Arrays.toString(password.getBytes()));
        System.out.println("Stored hash: " + storedHash);
        System.out.println("Match result: " + encoder.matches(password, storedHash));

        String freshHash = encoder.encode(password);
        System.out.println("Fresh hash: " + freshHash);
        System.out.println("Fresh hash verify: " + encoder.matches(password, freshHash));
    }
}
