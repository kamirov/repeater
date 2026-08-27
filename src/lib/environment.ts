const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function isLocalhost(hostname = typeof window === "undefined" ? "" : window.location.hostname): boolean {
  return LOCAL_HOSTNAMES.has(hostname.toLowerCase());
}
