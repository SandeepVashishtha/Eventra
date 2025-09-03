package com.eventra.config;

import java.util.Arrays;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.eventra.entity.Project;
import com.eventra.entity.ProjectStatus;
import com.eventra.repository.ProjectRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DataSeeder {

    @Bean
    @Profile("!test") // Don't run in test profile
    CommandLineRunner initProjects(ProjectRepository projectRepository) {
        return args -> {
            if (projectRepository.count() == 0) {
                log.info("Seeding initial project data...");
                
                Project project1 = Project.builder()
                    .title("AI-Powered Task Manager")
                    .description("Smart task management app that uses AI to prioritize and schedule tasks automatically. Features natural language processing and intelligent deadline suggestions.")
                    .author("Sarah Chen")
                    .contributors(Arrays.asList("Mike Johnson", "Alex Rodriguez"))
                    .stars(234)
                    .forks(67)
                    .category("AI/ML")
                    .techStack(Arrays.asList("React", "Python", "TensorFlow", "Node.js"))
                    .githubUrl("https://github.com/sarahchen/ai-task-manager")
                    .liveDemo("https://ai-taskmanager-demo.com")
                    .image("https://placehold.co/400x200/5C6BC0/FFFFFF?text=AI+Task+Manager")
                    .status(ProjectStatus.ACTIVE)
                    .difficulty("Intermediate")
                    .openIssues(8)
                    .pullRequests(3)
                    .build();

                Project project2 = Project.builder()
                    .title("Blockchain Voting System")
                    .description("Decentralized voting platform ensuring transparency and security. Built with smart contracts and modern web technologies.")
                    .author("David Kim")
                    .contributors(Arrays.asList("Lisa Wang", "Tom Anderson", "Maria Garcia"))
                    .stars(189)
                    .forks(45)
                    .category("Blockchain")
                    .techStack(Arrays.asList("Solidity", "React", "Web3.js", "Hardhat"))
                    .githubUrl("https://github.com/davidkim/blockchain-voting")
                    .liveDemo("https://blockchain-vote-demo.com")
                    .image("https://placehold.co/400x200/42A5F5/FFFFFF?text=Blockchain+Voting")
                    .status(ProjectStatus.ACTIVE)
                    .difficulty("Advanced")
                    .openIssues(12)
                    .pullRequests(7)
                    .build();

                Project project3 = Project.builder()
                    .title("Climate Data Visualizer")
                    .description("Interactive dashboard for visualizing climate change data with real-time updates and predictive analytics.")
                    .author("Emma Thompson")
                    .contributors(Arrays.asList("John Smith", "Ana Rodrigues"))
                    .stars(156)
                    .forks(34)
                    .category("Data Science")
                    .techStack(Arrays.asList("Python", "D3.js", "Django", "PostgreSQL"))
                    .githubUrl("https://github.com/emmathompson/climate-viz")
                    .liveDemo("https://climate-data-viz.com")
                    .image("https://placehold.co/400x200/66BB6A/FFFFFF?text=Climate+Data+Viz")
                    .status(ProjectStatus.ACTIVE)
                    .difficulty("Intermediate")
                    .openIssues(5)
                    .pullRequests(2)
                    .build();

                Project project4 = Project.builder()
                    .title("Real-time Chat Application")
                    .description("Modern chat application with end-to-end encryption, file sharing, and video calling capabilities.")
                    .author("Alex Rodriguez")
                    .contributors(Arrays.asList("Sophie Martin", "James Wilson"))
                    .stars(312)
                    .forks(89)
                    .category("Web Development")
                    .techStack(Arrays.asList("Socket.io", "React", "Node.js", "MongoDB"))
                    .githubUrl("https://github.com/alexrodriguez/realtime-chat")
                    .liveDemo("https://secure-chat-demo.com")
                    .image("https://placehold.co/400x200/9575CD/FFFFFF?text=Chat+App")
                    .status(ProjectStatus.ACTIVE)
                    .difficulty("Beginner")
                    .openIssues(3)
                    .pullRequests(1)
                    .build();

                Project project5 = Project.builder()
                    .title("IoT Smart Garden Monitor")
                    .description("IoT solution for monitoring garden conditions with automated watering and mobile notifications.")
                    .author("Roberto Silva")
                    .contributors(Arrays.asList("Linda Zhang"))
                    .stars(98)
                    .forks(23)
                    .category("IoT")
                    .techStack(Arrays.asList("Arduino", "React Native", "Firebase", "C++"))
                    .githubUrl("https://github.com/robertosilva/smart-garden")
                    .liveDemo(null)
                    .image("https://placehold.co/400x200/E57373/FFFFFF?text=IoT+Garden")
                    .status(ProjectStatus.MAINTENANCE)
                    .difficulty("Advanced")
                    .openIssues(15)
                    .pullRequests(0)
                    .build();

                projectRepository.saveAll(Arrays.asList(project1, project2, project3, project4, project5));
                log.info("Successfully seeded {} projects", 5);
            } else {
                log.info("Projects already exist, skipping data seeding");
            }
        };
    }
}
