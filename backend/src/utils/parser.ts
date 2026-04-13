import csvParser from "csv-parser";
import {Readable} from "stream";

// Use the require syntax for pdf-parse to bypass the "not callable" TS type error
const pdfParse = require("pdf-parse")

//Extracts raw text from a PDF file buffer
export const parsePDF = async (buffer: Buffer): Promise<string> =>{
    try {
        const data = await pdfParse(buffer);
        return data.text;
    }catch(err){
        console.error("Error parsing PDF:", err);
        throw new Error("Failed to parse PDF file");
    }
};

// Parses a CSV file buffer into an array of JSON objects
export const parseCSV = (buffer: Buffer): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const results: any[] = [];

        //convert buffer to a readable stream
        const stream = Readable.from(buffer);
        stream
            .pipe(csvParser())
            .on("data", (data) => results.push(data))
            .on("end", ()=> resolve(results))
            .on("error", (err) => reject(err));
    });
};