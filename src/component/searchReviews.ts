import fs from 'fs';
import csv from 'csv-parser';
import { getEmbedding } from './embedding';
import cosineSimilarity from './cosineSimilarity';

async function searchReviews(
  apiKey: string,
  productDescription: string,
  resolve: any,
  reject: any,
) {
  const embedding = await getEmbedding(apiKey, productDescription);
  const results = [];
  const headers = [];
  const inputFile = 'faq_data.csv';
  const n = 3;

  return fs
    .createReadStream(inputFile)
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
      resolve(topResults);
    })
    .on('error', (error) => {
      reject(error);
    });
}

export default searchReviews;
