export const requireAll = requireContext => requireContext.keys().map(x => requireContext(x).default);
