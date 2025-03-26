import fs from 'fs';
import csv from 'csv-parser';
import getEmbedding from './embedding';
import cosineSimilarity from './cosineSimilarity';

async function searchReviews(productDescription) {
  const embedding = await getEmbedding(productDescription);
  const results = [];
  const headers = [];
  const inputFile = 'output/embedded_1k_reviews.csv';
  const n = 3;

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('headers', (headerList) => headers.push(...headerList, 'similarities'))
    .on('data', (row) => {
      const adaEmbedding = JSON.parse(row['ada_embedding']);
      row['similarities'] = cosineSimilarity(adaEmbedding, embedding);
      results.push(row);
    })
    .on('end', () => {
      results.sort((a, b) => b['similarities'] - a['similarities']);
      const topResults = results.slice(0, n);
      console.log('Top Reviews:', topResults);
    });
}

export default searchReviews;
