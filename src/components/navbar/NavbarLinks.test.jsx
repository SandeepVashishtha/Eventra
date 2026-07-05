import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import NavbarLinks from "./NavbarLinks";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock("../../utils/routePrefetch", () => ({
  prefetchRoute: vi.fn(),
}));

describe("NavbarLinks", () => {
  it("keeps the community navigation link from shrinking and clipping", () => {
    render(
      <MemoryRouter>
        <NavbarLinks />
      </MemoryRouter>
    );

    const communityLink = screen.getByRole("link", { name: /nav\.community/i });

    expect(communityLink).toHaveClass("whitespace-nowrap");
    expect(communityLink).toHaveClass("shrink-0");
    expect(communityLink).toHaveClass("min-w-max");
  });
});
