import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { LandingPage } from "../features/landing/LandingPage.js";
import { AuthProvider } from "../context/AuthContext.js";
import { LanguageProvider } from "../context/LanguageContext.js";

describe("LandingPage Component", () => {
  it("renders brand name and main headline", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <LandingPage />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    const brands = screen.getAllByText(/AgriSage/i);
    expect(brands.length).toBeGreaterThan(0);

    const headline = screen.getByText(/Practical agricultural intelligence for/i);
    expect(headline).toBeDefined();

    const ctaButton = screen.getByText(/Get Started Free/i);
    expect(ctaButton).toBeDefined();
  });
});
