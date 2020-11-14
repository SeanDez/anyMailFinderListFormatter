import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse/lib/sync';

// ------------------------ Load input files
const inputFolder = path.join(__dirname, '../', '/input');
const inputFiles: string[] = fs.readdirSync(inputFolder);

// ----- error handling if no inputs
if (inputFiles.length === 0) { throw new Error('No input files detected'); }

inputFiles.forEach((fileName: string) => {
  const currentFilePath = path.join(inputFolder, fileName);
  const rawCsv = fs.readFileSync(currentFilePath);
  const csvContent = csvParse(rawCsv);
  // current file's data is captured for use

  csvContent.forEach((row: any) => {
    const [website, emailsJoined] = row;
    let emails: string[];

    // return if no emails. if at least one, split into array
    if (emailsJoined) {
      emails = emailsJoined.split(', ');
    } else { return; }

    const allWebsiteEmailPairs = emails!.map((email: string) => { website, email });
  });
});

// ------------------------- Write new output file

// const firstValue = '\ufeff'; // BOM
// const fileBody: string = [
//   'a,1\n', // First record
//   'b,2\n', // Second record
// ].join('\n');
// const fullFileContents: string = firstValue + fileBody;

// async function writeCsvFile() {
//   await fs.writeFileSync(targetFilePath, fullFileContents);
// }

// writeCsvFile();
