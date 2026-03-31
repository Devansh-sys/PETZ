package com.cts.mfrp.petzbackend.sosmedia.dto;

import com.cts.mfrp.petzbackend.enums.SosMediaType;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SosMediaResponse {

    private UUID id;
    private String fileUrl;
    private SosMediaType mediaType;
}