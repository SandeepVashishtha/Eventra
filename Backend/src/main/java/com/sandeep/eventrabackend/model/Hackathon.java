package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "hackathons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hackathon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String organizer;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String location;

    private String mode; // e.g., "Online", "In-person", "Hybrid"

    private String prizePool;

    private LocalDateTime registrationDeadline;

    private String imageUrl;
}
