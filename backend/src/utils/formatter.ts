import logger from "./logger";

/**
 * Format a date to ISO string or readable format
 */
export const formatDate = (date: Date | string | null | undefined, format: "iso" | "readable" = "iso"): string => {
  try {
    if (!date) return "N/A";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      logger.warn("Invalid date provided to formatDate", { date });
      return "Invalid Date";
    }

    if (format === "iso") {
      return dateObj.toISOString();
    }

    // readable format: "Jan 15, 2024 at 2:30 PM"
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    logger.error("Error formatting date", { error: err, date });
    return "Error";
  }
};

/**
 * Format salary with currency symbol
 */
export const formatSalary = (amount: number | null | undefined, currency: string = "USD"): string => {
  try {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "Not specified";
    }

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return formatter.format(amount);
  } catch (err) {
    logger.warn("Error formatting salary", { error: err, amount, currency });
    return `${amount}`;
  }
};

/**
 * Format score as percentage with color coding (console)
 */
export const formatScore = (score: number | null | undefined, includePercent: boolean = true): string => {
  try {
    if (score === null || score === undefined || isNaN(score)) {
      return "N/A";
    }

    const bounded = Math.max(0, Math.min(100, score));
    const formatted = bounded.toFixed(1);

    return includePercent ? `${formatted}%` : formatted;
  } catch (err) {
    logger.warn("Error formatting score", { error: err, score });
    return "Error";
  }
};

/**
 * Format recommendation level with description
 */
export const formatRecommendation = (
  recommendation: "Hire" | "Interview" | "Consider" | "Reject" | string | null | undefined
): string => {
  const recommendationMap: Record<string, string> = {
    Hire: "✓ Hire - Strong fit",
    Interview: "→ Interview - Good potential",
    Consider: "? Consider - Partial match",
    Reject: "✗ Reject - Not qualified",
  };

  return recommendationMap[recommendation as string] || "Unknown";
};

/**
 * Format years of experience
 */
export const formatExperience = (years: number | null | undefined): string => {
  try {
    if (years === null || years === undefined || isNaN(years)) {
      return "Not specified";
    }

    if (years < 1) {
      return "Less than 1 year";
    }

    if (years === 1) {
      return "1 year";
    }

    return `${years.toFixed(1)} years`;
  } catch (err) {
    logger.warn("Error formatting experience", { error: err, years });
    return "Error";
  }
};

/**
 * Format skills array as comma-separated string
 */
export const formatSkills = (skills: string[] | null | undefined, limit?: number): string => {
  try {
    if (!Array.isArray(skills) || skills.length === 0) {
      return "No skills listed";
    }

    const filtered = skills.filter((s) => s && typeof s === "string");
    const limited = limit ? filtered.slice(0, limit) : filtered;
    const joined = limited.join(", ");

    if (limit && filtered.length > limit) {
      return `${joined} +${filtered.length - limit} more`;
    }

    return joined;
  } catch (err) {
    logger.warn("Error formatting skills", { error: err });
    return "Error";
  }
};

/**
 * Format phone number (basic)
 */
export const formatPhone = (phone: string | null | undefined): string => {
  try {
    if (!phone || typeof phone !== "string") {
      return "Not provided";
    }

    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    if (cleaned.length === 11 && cleaned[0] === "1") {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    return phone; // return as-is if doesn't match expected format
  } catch (err) {
    logger.warn("Error formatting phone", { error: err, phone });
    return phone || "Error";
  }
};

/**
 * Format email (validate and lowercase)
 */
export const formatEmail = (email: string | null | undefined): string => {
  try {
    if (!email || typeof email !== "string") {
      return "Not provided";
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(trimmed)) {
      return trimmed;
    }

    logger.warn("Invalid email format", { email });
    return trimmed;
  } catch (err) {
    logger.warn("Error formatting email", { error: err, email });
    return email || "Error";
  }
};

/**
 * Format job title (capitalize first letter of each word)
 */
export const formatJobTitle = (title: string | null | undefined): string => {
  try {
    if (!title || typeof title !== "string") {
      return "Unknown";
    }

    return title
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  } catch (err) {
    logger.warn("Error formatting job title", { error: err, title });
    return title || "Error";
  }
};

/**
 * Format duration in days to human-readable format
 */
export const formatDuration = (days: number | null | undefined): string => {
  try {
    if (days === null || days === undefined || isNaN(days)) {
      return "Unknown";
    }

    if (days < 1) return "Less than a day";
    if (days === 1) return "1 day";
    if (days < 7) return `${Math.floor(days)} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    if (days < 365) return `${Math.floor(days / 30)} months`;

    return `${Math.floor(days / 365)} years`;
  } catch (err) {
    logger.warn("Error formatting duration", { error: err, days });
    return "Error";
  }
};