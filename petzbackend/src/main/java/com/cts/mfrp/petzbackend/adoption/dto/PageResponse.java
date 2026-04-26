package com.cts.mfrp.petzbackend.adoption.dto;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * Standard paginated response wrapper used across all list endpoints
 * in the adoption module (US-2.1.1 "Pagination/infinite scroll",
 * US-2.1.2 "Dynamic result count", US-2.4.1 list with filters).
 *
 * Beginner-friendly shape: same keys Spring Data's Page uses, minus the
 * internal Pageable metadata the frontend doesn't need.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    /** Map a Spring Data {@code Page<E>} into this DTO via a converter. */
    public static <E, T> PageResponse<T> from(Page<E> page, Function<E, T> mapper) {
        return PageResponse.<T>builder()
                .content(page.getContent().stream().map(mapper).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
