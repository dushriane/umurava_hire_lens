import csvParser from "csv-parser";
import { Readable } from "stream";
import logger from "./logger";

// Use require for pdf-parse due to CommonJS export
const pdfParse = require("pdf-parse");

/**
 * Extract raw text from a PDF file buffer
 * @param buffer PDF file contents
 * @returns Extracted text content
 * @throws Error if PDF parsing fails
 */
export const parsePDF = async (buffer: Buffer): Promise<string> => {
  try {
    // Validate input
    if (!buffer || buffer.length === 0) {
      throw new Error("PDF buffer is empty or null");
    }

    logger.debug("Parsing PDF", { size: buffer.length });

    const data = await pdfParse(buffer);
    const text = data.text || "";

    logger.info("PDF parsed successfully", {
      size: buffer.length,
      textLength: text.length,
      pages: data.numpages || 0,
    });

    return text;
  } catch (err) {
    logger.error("Failed to parse PDF", {
      error: err,
      bufferSize: buffer?.length || 0,
    });
    throw new Error("Failed to parse PDF file");
  }
};

/**
 * Parse a CSV file buffer into an array of JSON objects
 * @param buffer CSV file contents
 * @returns Array of parsed records
 * @throws Error if CSV parsing fails
 */
export const parseCSV = (buffer: Buffer): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    try {
      // Validate input
      if (!buffer || buffer.length === 0) {
        throw new Error("CSV buffer is empty or null");
      }

      logger.debug("Parsing CSV", { size: buffer.length });

      const results: any[] = [];

      // Convert buffer to readable stream
      const stream = Readable.from(buffer);

      stream
        .pipe(csvParser())
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", () => {
          logger.info("CSV parsed successfully", {
            size: buffer.length,
            records: results.length,
          });
          resolve(results);
        })
        .on("error", (err) => {
          logger.error("CSV parsing error", {
            error: err,
            bufferSize: buffer.length,
            recordsProcessed: results.length,
          });
          reject(new Error("Failed to parse CSV file"));
        });
    } catch (err) {
      logger.error("CSV parsing initialization failed", {
        error: err,
        bufferSize: buffer?.length || 0,
      });
      reject(new Error("Failed to parse CSV file"));
    }
  });
};