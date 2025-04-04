import { Injectable, Logger } from '@nestjs/common';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as pLimit from 'p-limit';

dotenv.config();

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly client: OpenAI;
  private readonly dirPdfs: string;
  private readonly maxConcurrency = 10;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env['API_KEY'] });
    this.dirPdfs = process.env['dir'];
  }

  async uploadSinglePdf(
    filePath: string,
    vectorStoreId: string,
  ): Promise<{ file: string; status: string; error?: string }> {
    const fileName = path.basename(filePath);
    try {
      const fileResponse = await this.client.files.create({
        file: createReadStream(filePath),
        purpose: 'assistants',
      });
      await this.client.vectorStores.files.create(vectorStoreId, {
        file_id: fileResponse.id,
      });
      return { file: fileName, status: 'success' };
    } catch (error) {
      this.logger.error(`Error with ${fileName}: ${error.message}`);
      return { file: fileName, status: 'failed', error: error.message };
    }
  }

  async uploadPdfFilesToVectorStore(vectorStoreId: string): Promise<{
    total_files: number;
    successful_uploads: number;
    failed_uploads: number;
    errors: any[];
  }> {
    const pdfFiles = fs
      .readdirSync(this.dirPdfs)
      .map((file) => path.join(this.dirPdfs, file));
    const stats = {
      total_files: pdfFiles.length,
      successful_uploads: 0,
      failed_uploads: 0,
      errors: [],
    };

    this.logger.log(
      `${pdfFiles.length} PDF files to process. Uploading in parallel...`,
    );

    const limit = pLimit(this.maxConcurrency);
    const tasks = pdfFiles.map((filePath) =>
      limit(() => this.uploadSinglePdf(filePath, vectorStoreId)),
    );
    const results = await Promise.all(tasks);

    results.forEach((result) => {
      if (result.status === 'success') {
        stats.successful_uploads += 1;
      } else {
        stats.failed_uploads += 1;
        stats.errors.push(result);
      }
    });

    return stats;
  }

  async createVectorStore(storeName: string): Promise<{
    id?: string;
    name?: string;
    created_at?: string;
    file_count?: number;
  }> {
    try {
      const vectorStore = await this.client.vectorStores.create({
        name: storeName,
      });
      const details = {
        id: vectorStore.id,
        name: vectorStore.name,
        created_at: String(vectorStore.created_at),
        file_count: vectorStore.file_counts.completed,
      };
      this.logger.log('Vector store created:', details);
      return details;
    } catch (error) {
      this.logger.error(`Error creating vector store: ${error.message}`);
      return {};
    }
  }
}
