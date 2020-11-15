import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse/lib/sync';

// ------------------------ Load input files
const inputFolder = path.join(__dirname, '../', '/input');
const inputFiles: string[] = fs.readdirSync(inputFolder);

// ----- error handling if no inputs
if (inputFiles.length === 0) { throw new Error('No input files detected'); }

const fileContentsRaw = inputFiles.map((fileName: string) => {
  const currentFilePath = path.join(inputFolder, fileName);
  const rawCsv = fs.readFileSync(currentFilePath);
  const csvContent = csvParse(rawCsv);
  // current file's data is captured for use

  const allRecords: object[][] = csvContent.map((row: any) => {
    const [company, website, emailsJoined] = row;
    let emails: string[];

    // return if no emails. if at least one, split into array
    if (emailsJoined) {
      emails = emailsJoined.split(', ');
    } else { return; }

    const records: object[] = emails!.map((email: string) => ({ company, website, email }));

    return records;
  });

  const noUndefined = allRecords
    .filter((maybeAnArray: object[] | undefined) => Array.isArray(maybeAnArray));
  const flattened = noUndefined.concat(...noUndefined);

  return flattened;
})[0];

const fileContentsFlattened: object[] = [];
fileContentsRaw.forEach((rowOrList: object[]) => {
  if (Array.isArray(rowOrList)) {
    rowOrList.forEach((nestedRow: object) => {
      fileContentsFlattened.push(nestedRow);
    });
  } else {
    fileContentsFlattened.push(rowOrList);
  }
});

// do final uncaught array check
fileContentsFlattened.forEach((row: object, index: number) => {
  if (Array.isArray(row)) { console.log('nested array detected: ', index, row); }
});

// ------------------------- Write new output file

// console.log('fileContentsRaw[0]', fileContentsRaw[0]);
// console.log('fileContentsRaw[1]', fileContentsRaw[1]);

// const eachRowAsString = fileContentsRaw.reduce((accumulator: string, currentVal: object) => {
//   const { company, email, website } = currentVal;
//   const rowAsString = `${company},${email},${website}\n`;
//   return accumulator + rowAsString;
// }, '');

// console.log('eachRowAsString', eachRowAsString);

const firstValue = '\ufeff'; // BOM


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
