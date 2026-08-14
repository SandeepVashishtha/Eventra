package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Component;

/**
 * Skill distance calculations helper class (#17673).
 */
@Component
public class SkillVectorComparator {

    public double computeDistance(double[] v1, double[] v2) {
        if (v1 == null || v2 == null || v1.length != v2.length) {
            return 0.0;
        }

        double sum = 0.0;
        for (int i = 0; i < v1.length; i++) {
            sum += Math.pow(v1[i] - v2[i], 2);
        }
        return Math.sqrt(sum);
    }
}
