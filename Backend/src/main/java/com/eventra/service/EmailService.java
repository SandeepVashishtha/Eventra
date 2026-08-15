package com.eventra.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.logging.Logger;
import java.util.regex.Pattern;

@Service
public class EmailService {

    private static final Logger logger = Logger.getLogger(EmailService.class.getName());

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void sendTransactionalEmail(String to, String subject, String title, String recipientName, String messageBody, String actionUrl, String actionText) throws MessagingException {
        if (to == null || to.isBlank() || !EMAIL_PATTERN.matcher(to).matches()) {
            throw new IllegalArgumentException("Invalid recipient email address: " + to);
        }
        Context context = new Context();
        context.setVariable("subject", subject);
        context.setVariable("title", title);
        context.setVariable("recipientName", recipientName);
        context.setVariable("messageBody", messageBody);
        context.setVariable("actionUrl", actionUrl);
        context.setVariable("actionText", actionText);

        String htmlContent = templateEngine.process("email/transactional-email", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
        logger.info("Sent externalized Thymeleaf transactional email to " + to);
    }
}
