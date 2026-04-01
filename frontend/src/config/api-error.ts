/**
 * Extracts a human-readable message from axios/Django REST error responses.
 * Supports BaseResponse shape { message, errors }, legacy { msg }, and DRF { detail }.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  const err = error as {
    response?: { data?: unknown };
    message?: string;
  };
  const data = err?.response?.data;

  if (data == null || typeof data !== "object") {
    if (err?.message && typeof err.message === "string" && err.message !== "Network Error") {
      return err.message;
    }
    return fallback;
  }

  const d = data as Record<string, unknown>;

  if (typeof d.detail === "string" && d.detail.trim()) {
    return d.detail;
  }
  if (Array.isArray(d.detail) && d.detail.length) {
    return d.detail
      .map((x) => (typeof x === "string" ? x : JSON.stringify(x)))
      .join(" ");
  }

  const msg = (d.message ?? d.msg) as string | undefined;
  const flatErrors = d.errors != null ? flattenDrfErrors(d.errors) : "";

  if (flatErrors) {
    if (msg && msg !== "Invalid data") {
      return `${msg}: ${flatErrors}`;
    }
    return flatErrors;
  }

  if (msg && msg.trim()) {
    return msg;
  }

  return fallback;
}

function flattenDrfErrors(errors: unknown): string {
  if (errors == null) return "";
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) {
    return errors
      .map((e) => flattenDrfErrors(e))
      .filter(Boolean)
      .join("; ");
  }
  if (typeof errors === "object") {
    return Object.entries(errors as Record<string, unknown>)
      .map(([key, val]) => {
        const inner = flattenDrfErrors(val);
        if (!inner) return "";
        if (/^\d+$/.test(key)) {
          return inner;
        }
        return `${key}: ${inner}`;
      })
      .filter(Boolean)
      .join("; ");
  }
  return String(errors);
}
