package com.sandeep.eventrabackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitProperties {

    private boolean enabled = true;
    private EndpointLimit login = new EndpointLimit(5, Duration.ofMinutes(1));
    private EndpointLimit signup = new EndpointLimit(3, Duration.ofMinutes(10));
    private EndpointLimit forgotPassword = new EndpointLimit(3, Duration.ofMinutes(15));
    private EndpointLimit contact = new EndpointLimit(5, Duration.ofMinutes(10));

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public EndpointLimit getLogin() {
        return login;
    }

    public void setLogin(EndpointLimit login) {
        this.login = login;
    }

    public EndpointLimit getSignup() {
        return signup;
    }

    public void setSignup(EndpointLimit signup) {
        this.signup = signup;
    }

    public EndpointLimit getForgotPassword() {
        return forgotPassword;
    }

    public void setForgotPassword(EndpointLimit forgotPassword) {
        this.forgotPassword = forgotPassword;
    }

    public EndpointLimit getContact() {
        return contact;
    }

    public void setContact(EndpointLimit contact) {
        this.contact = contact;
    }

    public static class EndpointLimit {
        private int capacity;
        private Duration window;

        public EndpointLimit() {
        }

        public EndpointLimit(int capacity, Duration window) {
            this.capacity = capacity;
            this.window = window;
        }

        public int getCapacity() {
            return capacity;
        }

        public void setCapacity(int capacity) {
            this.capacity = capacity;
        }

        public Duration getWindow() {
            return window;
        }

        public void setWindow(Duration window) {
            this.window = window;
        }
    }
}
