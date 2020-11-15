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
});
// each file is a subarray

// @ts-ignore
const allFilesInOne = [].concat(...fileContentsRaw);

const fileContentsFlattened: object[] = [];
allFilesInOne.forEach((rowOrList: object[]) => {
  if (Array.isArray(rowOrList)) {
    rowOrList.forEach((nestedRow: object) => {
      fileContentsFlattened.push(nestedRow);
    });
  } else {
    fileContentsFlattened.push(rowOrList);
  }
});

// uncaught array check
fileContentsFlattened.forEach((row: object, index: number) => {
  if (Array.isArray(row)) { console.log('nested array detected: ', index, row); }
});

// ------------------------- Write new output file

const eachRowAsString = fileContentsFlattened.reduce(
  (accumulator: string, currentValue: object, index: number) => {
    if (Object.keys(currentValue).length === 0) { return accumulator; }

    // update column headers
    if (index === 0) {
      return 'company,email,website\n';
    }

    // @ts-ignore
    const { company, email, website } = currentValue;
    if (
      typeof company === 'undefined'
      || typeof email === 'undefined'
      || typeof website === 'undefined'
    ) { return accumulator; }

    const lastIndex = fileContentsFlattened.length - 1;
    const isLastIndex = index === lastIndex;
    const newLineIfNotLastIndex = isLastIndex === false && '\n';

    return `${accumulator}${company},${email},${website}${newLineIfNotLastIndex}`;
  }, '',
);

// console.log('eachRowAsString', eachRowAsString);

// ------------------ Build and write output file

const csvHeader = '\ufeff'; // BOM
const allCsvContents = `${csvHeader}${eachRowAsString}`;

const outputFolder = path.join(__dirname, '../output');
const outputFileName = process.argv[2];
const fullOutputFilePath = path.join(outputFolder, outputFileName);

async function writeCsvFile(targetFilePath: string, fullFileContents: string) {
  await fs.writeFileSync(targetFilePath, fullFileContents);
}

writeCsvFile(fullOutputFilePath, allCsvContents);

// const firstValue = '\ufeff'; // BOM
// const fileBody: string = [
//   'a,1\n', // First record
//   'b,2\n', // Second record
// ].join('\n');
// const fullFileContents: string = firstValue + fileBody;
