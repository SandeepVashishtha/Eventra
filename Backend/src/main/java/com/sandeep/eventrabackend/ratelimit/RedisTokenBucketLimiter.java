package com.sandeep.eventrabackend.ratelimit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;

@Component
public class RedisTokenBucketLimiter {

    private final StringRedisTemplate redisTemplate;
    private final DefaultRedisScript<Long> rateLimitScript;

    public RedisTokenBucketLimiter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.rateLimitScript = new DefaultRedisScript<>();
        this.rateLimitScript.setResultType(Long.class);
        this.rateLimitScript.setScriptText(
            "local key = KEYS[1] " +
            "local limit = tonumber(ARGV[1]) " +
            "local current = tonumber(redis.call('get', key) or '0') " +
            "if current + 1 > limit then " +
            "  return 0 " +
            "else " +
            "  redis.call('INCRBY', key, 1) " +
            "  if current == 0 then " +
            "    redis.call('EXPIRE', key, 60) " +
            "  end " +
            "  return 1 " +
            "end"
        );
    }

    public boolean isAllowed(String key, int limit) {
        List<String> keys = Collections.singletonList("rate_limit:" + key);
        Long result = redisTemplate.execute(rateLimitScript, keys, String.valueOf(limit));
        return result != null && result == 1;
    }
}
