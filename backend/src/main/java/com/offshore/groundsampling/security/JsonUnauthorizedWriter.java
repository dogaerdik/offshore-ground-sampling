package com.offshore.groundsampling.security;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public final class JsonUnauthorizedWriter {

    private static final String BODY = "{\"error\":\"Unauthorized\"}";

    private JsonUnauthorizedWriter() {
    }

    public static void write(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(BODY);
    }
}
