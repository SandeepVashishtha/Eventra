export const mockNavigateFn = (path) => {
  if (globalThis.ReactRouterDomMock?.navigate) {
    globalThis.ReactRouterDomMock.navigate(path);
  }
};

export const useNavigate = () => mockNavigateFn;

export const Link = ({ to, children, ...props }) => {
  return {
    $$typeof: Symbol.for("react.element"),
    type: "a",
    props: { href: to, children, ...props }
  };
};

export default {
  useNavigate,
  Link
};
