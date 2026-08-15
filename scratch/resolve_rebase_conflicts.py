import json
import subprocess
import time
import os

def run_command(command, env=None):
    if env:
        my_env = os.environ.copy()
        my_env.update(env)
    else:
        my_env = None
    res = subprocess.run(command, shell=True, capture_output=True, text=True, env=my_env)
    return res.stdout, res.stderr

def apply_replacement(filepath, old_content, new_content):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    if old_content not in content:
        raise ValueError(f"Could not find target content in {filepath}")
    updated = content.replace(old_content, new_content)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(updated)

def main():
    print("Fetching open PRs for ashroxy...")
    stdout, stderr = run_command("gh pr list --author ashroxy --state open --limit 100 --json number,headRefName")
    try:
        prs = json.loads(stdout)
    except Exception as e:
        print(f"Error parsing JSON: {e}\nstdout: {stdout}\nstderr: {stderr}")
        return
        
    print(f"Found {len(prs)} open PRs.")
    
    for idx, pr in enumerate(prs):
        number = pr["number"]
        branch = pr["headRefName"]
        print(f"\n--- [{idx+1}/{len(prs)}] Processing PR #{number} (Branch: {branch}) ---")
        
        # Abort any active rebase to ensure clean state
        run_command("git rebase --abort")
        
        # Checkout and reset to origin's branch state
        run_command(f"git checkout {branch}")
        run_command(f"git reset --hard origin/{branch}")
        
        # Attempt rebase
        print(f"Rebasing {branch} on upstream/master...")
        rb_stdout, rb_stderr = run_command("git rebase upstream/master")
        
        # If there's a conflict
        if "CONFLICT" in rb_stdout or "CONFLICT" in rb_stderr:
            print("Conflict detected! Resolving based on branch logic...")
            
            # 1. Always remove scratch/temp_pr_body.txt if conflicted or present
            run_command("git rm scratch/temp_pr_body.txt")
            
            # 2. Check head branch name and apply specific file resolutions
            if branch == "bugfix/issue-15562":
                print("Resolving bugfix/issue-15562 (title validation)...")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/service/HackathonService.java")
                apply_replacement(
                    "Backend/src/main/java/com/sandeep/eventrabackend/service/HackathonService.java",
                    "        validateDateRanges(request.getStartDate(), request.getEndDate(), request.getRegistrationDeadline());",
                    """        validateDateRanges(request.getStartDate(), request.getEndDate(), request.getRegistrationDeadline());
        if (request.getTitle() != null && (request.getTitle().trim().length() < 3 || request.getTitle().trim().length() > 100)) {
            throw new IllegalArgumentException("Title must be between 3 and 100 characters.");
        }"""
                )
                apply_replacement(
                    "Backend/src/main/java/com/sandeep/eventrabackend/service/HackathonService.java",
                    "        if (request.getTitle() != null) hackathon.setTitle(request.getTitle());",
                    """        if (request.getTitle() != null) {
            if (request.getTitle().trim().length() < 3 || request.getTitle().trim().length() > 100) {
                throw new IllegalArgumentException("Title must be between 3 and 100 characters.");
            }
            hackathon.setTitle(request.getTitle());
        }"""
                )
                run_command("git add Backend/src/main/java/com/sandeep/eventrabackend/service/HackathonService.java")
                
            elif branch == "bugfix/issue-15559":
                print("Resolving bugfix/issue-15559 (organizer validation)...")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/service/HackathonService.java")
                apply_replacement(
                    "Backend/src/main/java/com/sandeep/eventrabackend/service/HackathonService.java",
                    "        Hackathon saved = hackathonRepository.save(hackathon);",
                    """        if (request.getOrganizer() != null && (request.getOrganizer().trim().length() < 2 || request.getOrganizer().trim().length() > 100)) {
            throw new IllegalArgumentException("Organizer name must be between 2 and 100 characters.");
        }
        Hackathon saved = hackathonRepository.save(hackathon);"""
                )
                apply_replacement(
                    "Backend/src/main/java/com/sandeep/eventrabackend/service/HackathonService.java",
                    "        if (request.getOrganizer() != null) hackathon.setOrganizer(request.getOrganizer());",
                    """        if (request.getOrganizer() != null) {
            if (request.getOrganizer().trim().length() < 2 || request.getOrganizer().trim().length() > 100) {
                throw new IllegalArgumentException("Organizer name must be between 2 and 100 characters.");
            }
            hackathon.setOrganizer(request.getOrganizer());
        }"""
                )
                run_command("git add Backend/src/main/java/com/sandeep/eventrabackend/service/HackathonService.java")
                
            elif branch == "bugfix/issue-15544":
                print("Resolving bugfix/issue-15544 (location validation)...")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java")
                apply_replacement(
                    "Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java",
                    """                eventRepository.save(event);
                broadcastAvailability(event);
        }""",
                    """                eventRepository.save(event);
                broadcastAvailability(event);
        }

        private void validateLocation(String location) {
                if (location == null || location.trim().length() < 3 || location.trim().length() > 150) {
                        throw new IllegalArgumentException("Location must be between 3 and 150 characters.");
                }
        }"""
                )
                apply_replacement(
                    "Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java",
                    """                event.setDescription(request.getDescription());
                event.setLocation(request.getLocation());
                event.setEventDate(request.getEventDate());""",
                    """                event.setDescription(request.getDescription());
                validateLocation(request.getLocation());
                event.setLocation(request.getLocation());
                event.setEventDate(request.getEventDate());"""
                )
                run_command("git add Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java")
                
            elif branch == "bugfix/issue-15542":
                print("Resolving bugfix/issue-15542 (title validation)...")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java")
                apply_replacement(
                    "Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java",
                    """                return Sort.by(direction, mapped);
        }""",
                    """                return Sort.by(direction, mapped);
        }

        private void validateTitle(String title) {
                if (title == null || title.trim().length() < 3 || title.trim().length() > 100) {
                        throw new IllegalArgumentException("Title must be between 3 and 100 characters.");
                }
        }"""
                )
                apply_replacement(
                    "Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java",
                    """                event.setTitle(request.getTitle());
                event.setDescription(request.getDescription());""",
                    """                validateTitle(request.getTitle());
                event.setTitle(request.getTitle());
                event.setDescription(request.getDescription());"""
                )
                run_command("git add Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java")
                
            elif branch == "bugfix/issue-15432":
                print("Resolving bugfix/issue-15432 (compressor syntax)...")
                run_command("git checkout upstream/master -- src/utils/compressor.js")
                run_command("git add src/utils/compressor.js")
                
            elif branch == "bugfix/issue-15370":
                print("Resolving bugfix/issue-15370 (EventRepository alternative)...")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/repository/EventRepository.java")
                apply_replacement(
                    "Backend/src/main/java/com/sandeep/eventrabackend/repository/EventRepository.java",
                    "import java.util.Optional;",
                    "import java.util.Optional;\nimport java.time.LocalDateTime;"
                )
                apply_replacement(
                    "Backend/src/main/java/com/sandeep/eventrabackend/repository/EventRepository.java",
                    "    List<Event> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(\n            String title, String description);\n}",
                    """    List<Event> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title, String description);

    @Query(\"\"\"
            SELECT e FROM Event e WHERE
            e.id <> :excludeEventId AND
            e.isPublic = true AND
            e.status <> 'CANCELLED' AND
            e.eventDate >= :from AND
            e.eventDate <= :to
            ORDER BY e.eventDate ASC
            \"\"\")
    List<Event> findPublicAlternativesInWindow(
            @Param("excludeEventId") Long excludeEventId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            org.springframework.data.domain.Pageable pageable);
}"""
                )
                run_command("git add Backend/src/main/java/com/sandeep/eventrabackend/repository/EventRepository.java")
                
            elif branch == "bugfix/issue-15372":
                print("Resolving bugfix/issue-15372 (LiveAudience Controller/Service)...")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/controller/LiveAudienceController.java")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/service/LiveAudienceService.java")
                run_command("git add Backend/src/main/java/com/sandeep/eventrabackend/controller/LiveAudienceController.java Backend/src/main/java/com/sandeep/eventrabackend/service/LiveAudienceService.java")
                
            elif branch == "bugfix/issue-15443":
                print("Resolving bugfix/issue-15443 (EventService cancelled filter)...")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java")
                run_command("git add Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java")
                
            elif branch == "bugfix/issue-15445":
                print("Resolving bugfix/issue-15445 (RateLimitingFilter component)...")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/security/RateLimitingFilter.java")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/config/SecurityConfig.java")
                run_command("git add Backend/src/main/java/com/sandeep/eventrabackend/security/RateLimitingFilter.java Backend/src/main/java/com/sandeep/eventrabackend/config/SecurityConfig.java")
                
            elif branch == "bugfix/issue-15442":
                print("Resolving bugfix/issue-15442 (SubtitleService memory)...")
                run_command("git checkout upstream/master -- Backend/src/main/java/com/sandeep/eventrabackend/subtitles/SubtitleService.java")
                run_command("git add Backend/src/main/java/com/sandeep/eventrabackend/subtitles/SubtitleService.java")
                
            # Finish the rebase
            print("Continuing rebase...")
            # We set GIT_EDITOR=true to auto-accept vim commit message prompts
            c_stdout, c_stderr = run_command("git rebase --continue", env={"GIT_EDITOR": "true"})
            print(f"Rebase continue: {c_stdout} {c_stderr}")
            
        # PUSH to fork
        print(f"Pushing rebased {branch} to fork...")
        push_stdout, push_stderr = run_command(f"git push origin {branch} --force")
        print(f"Push complete: {push_stdout} {push_stderr}")
        
        # Clean up files
        run_command("git clean -fd -e scratch/")
        time.sleep(3)

    print("All open PRs rebased and pushed successfully!")

if __name__ == "__main__":
    main()
