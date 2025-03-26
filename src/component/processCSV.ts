import fs from 'fs';
import csv from 'csv-parser';
import getEmbedding from './embedding';

async function processCSV(inputFile, outputFile) {
  const results = [];
  const headers = [];

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('headers', (headerList) => headers.push(...headerList, 'ada_embedding'))
    .on('data', async (row) => {
      row['ada_embedding'] = JSON.parse(await getEmbedding(row['combined']));
      results.push(row);
    })
    .on('end', () => {
      const csvContent = [
        headers.join(','),
        ...results.map((r) => Object.values(r).join(',')),
      ].join('\n');
      fs.writeFileSync(outputFile, csvContent);
      console.log('CSV processing complete. Output saved to', outputFile);
    });
}

export default processCSV;
