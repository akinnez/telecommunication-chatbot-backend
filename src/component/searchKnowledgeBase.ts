import { Pool } from 'pg';
import dotenv from 'dotenv';
import { getEmbedding } from './embedding';
import cosineSimilarity from './cosineSimilarity';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function searchKnowledgeBase(apiKey, userQuery, n = 3) {
  const embedding = await getEmbedding(apiKey, userQuery);
  const client = await pool.connect();

  try {
    const res = await client.query(
      'SELECT id, response, ada_embedding FROM chatbot_knowledge',
    );
    const results = res.rows.map((row) => {
      const adaEmbedding = JSON.parse(row.ada_embedding);
      return { ...row, similarity: cosineSimilarity(adaEmbedding, embedding) };
    });

    results.sort((a, b) => b.similarity - a.similarity);
    const topResults = results.slice(0, n);
    console.log('Top Matches:', topResults);
    return topResults;
  } finally {
    client.release();
  }
}

export default searchKnowledgeBase;
