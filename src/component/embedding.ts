import { OpenAI } from 'openai';

async function getEmbedding(text, model = 'text-embedding-3-small') {
  text = text.replace(/\n/g, ' ');
  const response = await this.genAI.embeddings.create({
    input: [text],
    model: model,
  });
  return response.data[0].embedding;
}

export default getEmbedding;
