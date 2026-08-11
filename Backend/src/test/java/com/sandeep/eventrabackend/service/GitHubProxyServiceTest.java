package com.sandeep.eventrabackend.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GitHubProxyServiceTest {

    @Test
    @DisplayName("Allowlists Eventra repo paths and public user lookups (#13585)")
    void allowlistsExpectedPaths() {
        assertTrue(GitHubProxyService.isAllowlisted("repos/sandeepvashishtha/Eventra"));
        assertTrue(GitHubProxyService.isAllowlisted("repos/SandeepVashishtha/eventra/contributors"));
        assertTrue(GitHubProxyService.isAllowlisted("users/octocat"));
        assertTrue(GitHubProxyService.isAllowlisted("users/octocat/repos"));
    }

    @Test
    @DisplayName("Rejects arbitrary repos/orgs and unsafe user paths (#13585)")
    void rejectsNonAllowlistedPaths() {
        assertFalse(GitHubProxyService.isAllowlisted("repos/other-org/private-repo"));
        assertFalse(GitHubProxyService.isAllowlisted("orgs/sandeepvashishtha"));
        assertFalse(GitHubProxyService.isAllowlisted("users/../admins"));
        assertFalse(GitHubProxyService.isAllowlisted("user/octocat"));
        assertFalse(GitHubProxyService.isAllowlisted("gists/1"));
    }
}
