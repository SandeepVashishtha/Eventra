package com.sandeep.eventrabackend.exception;

public class CouponRedemptionException extends RuntimeException {
    public CouponRedemptionException(String message) {
        super(message);
    }

    public CouponRedemptionException(String message, Throwable cause) {
        super(message, cause);
    }
}
