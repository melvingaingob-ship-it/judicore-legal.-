/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Chunk size: 8MB (8 * 1024 * 1024 bytes) - well within Cloud Run / Nginx 32MB HTTP request limit
export const CHUNK_SIZE = 8 * 1024 * 1024;
export const DIRECT_UPLOAD_LIMIT = 20 * 1024 * 1024; // 20MB threshold for direct vs chunked

export interface UploadProgressCallback {
  (percentage: number, statusMessage: string): void;
}

export interface ChunkUploadResult {
  success: boolean;
  completed: boolean;
  fileName: string;
  streamUrl: string;
  fileSize?: number;
}

/**
 * Uploads any audio file in resilient 8MB chunks to avoid HTTP 413 Payload Too Large
 * and connection resets on large court audio records.
 */
export async function uploadAudioInChunks(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<ChunkUploadResult> {
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  console.log(`[ChunkUploader] Uploading "${cleanFileName}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) in ${totalChunks} chunk(s) of 8MB.`);

  let lastResult: ChunkUploadResult = {
    success: false,
    completed: false,
    fileName: cleanFileName,
    streamUrl: `/api/stream-audio/${encodeURIComponent(cleanFileName)}`,
  };

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunkBlob = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunkBlob, `chunk_${chunkIndex}`);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', cleanFileName);

    const percent = Math.round(((chunkIndex) / totalChunks) * 100);
    onProgress?.(percent, `Streaming court audio chunk ${chunkIndex + 1}/${totalChunks} (${percent}%)...`);

    let response: Response;
    try {
      response = await fetch('/api/upload-chunk', {
        method: 'POST',
        body: formData,
      });
    } catch (netErr: any) {
      console.warn(`[ChunkUploader] Network error on chunk ${chunkIndex}, retrying once:`, netErr);
      // Brief pause and single retry
      await new Promise((r) => setTimeout(r, 1000));
      response = await fetch('/api/upload-chunk', {
        method: 'POST',
        body: formData,
      });
    }

    if (!response.ok) {
      throw new Error(`Ingestion gateway rejected chunk ${chunkIndex + 1}/${totalChunks}: status ${response.status}`);
    }

    const data = await response.json();
    lastResult = data;
  }

  onProgress?.(100, `Audio chunks fully assembled on judicial gateway.`);
  return {
    ...lastResult,
    completed: true,
    fileName: cleanFileName,
    streamUrl: `/api/stream-audio/${encodeURIComponent(cleanFileName)}`,
  };
}

/**
 * Resilient court audio transcription pipeline:
 * 1. Checks file size against the direct upload limit (20MB).
 * 2. If > 20MB, uploads via chunked pipeline first, then requests transcription by serverFilename.
 * 3. If <= 20MB, attempts direct upload. If the gateway rejects with 413, automatically
 *    falls back to the chunked upload pipeline without crashing.
 */
export async function transcribeCourtAudio(
  file: File,
  options?: {
    speakerRegistry?: any[];
    prompt?: string;
    onProgress?: (stage: string) => void;
  }
): Promise<{ text: string; segments?: any[]; candidates?: any[] }> {
  const onProgress = options?.onProgress || (() => {});
  const mimeType = file.type || (file.name.toLowerCase().endsWith('.aac') ? 'audio/aac' : 'audio/webm');
  const cleanPrompt = options?.prompt || "Perform formal verbatim legal transcription. Identify individual speakers accurately, avoid stutter loops, and map precise [HH:MM:SS] timestamps.";

  // If the file exceeds 20MB, preemptively use the chunked ingestion pipeline to prevent 413
  if (file.size > DIRECT_UPLOAD_LIMIT) {
    console.log(`[TranscribePipeline] Audio file size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds direct threshold. Preemptively using chunked streaming.`);
    onProgress(`Chunk-streaming court recording to gateway (0%)...`);
    
    const chunkResult = await uploadAudioInChunks(file, (pct, msg) => {
      onProgress(msg);
    });

    onProgress('Audio assembled. Analyzing judicial recording with Gemini 3.5 Transcribe...');

    const res = await fetch('/api/process-namibian-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serverFilename: chunkResult.fileName,
        fileName: chunkResult.fileName,
        mimeType,
        prompt: cleanPrompt,
        speakerRegistry: options?.speakerRegistry || [],
      }),
    });

    if (!res.ok) {
      throw new Error(`Ingestion gateway rejected payload: ${res.status}`);
    }

    return await res.json();
  }

  // Under 20MB: attempt direct upload first
  try {
    onProgress('Streaming court audio to ingestion gateway...');
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('file', file);
    formData.append('mimeType', mimeType);
    formData.append('prompt', cleanPrompt);
    if (options?.speakerRegistry) {
      formData.append('speakerRegistry', JSON.stringify(options.speakerRegistry));
    }

    const directResponse = await fetch('/api/process-namibian-record', {
      method: 'POST',
      body: formData,
    });

    // If gateway returns 413 Payload Too Large, seamlessly recover using chunked streaming
    if (directResponse.status === 413) {
      console.warn('[TranscribePipeline] Gateway returned 413. Recovering via chunked upload pipeline...');
      onProgress('Gateway payload limit detected. Re-routing via chunked streaming pipeline...');
      
      const chunkResult = await uploadAudioInChunks(file, (pct, msg) => {
        onProgress(msg);
      });

      onProgress('Audio assembled. Analyzing court recording with Gemini 3.5 Transcribe...');
      const recoveryResponse = await fetch('/api/process-namibian-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverFilename: chunkResult.fileName,
          fileName: chunkResult.fileName,
          mimeType,
          prompt: cleanPrompt,
          speakerRegistry: options?.speakerRegistry || [],
        }),
      });

      if (!recoveryResponse.ok) {
        throw new Error(`Ingestion gateway rejected payload: ${recoveryResponse.status}`);
      }

      return await recoveryResponse.json();
    }

    if (!directResponse.ok) {
      throw new Error(`Ingestion gateway rejected payload: ${directResponse.status}`);
    }

    return await directResponse.json();

  } catch (err: any) {
    // If the error message mentions 413, attempt chunked recovery
    if (err?.message?.includes('413')) {
      console.warn('[TranscribePipeline] Caught 413 exception. Executing chunked recovery...');
      onProgress('Recovering from gateway size limit via chunked stream...');
      const chunkResult = await uploadAudioInChunks(file, (pct, msg) => {
        onProgress(msg);
      });

      const recoveryResponse = await fetch('/api/process-namibian-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverFilename: chunkResult.fileName,
          fileName: chunkResult.fileName,
          mimeType,
          prompt: cleanPrompt,
          speakerRegistry: options?.speakerRegistry || [],
        }),
      });

      if (!recoveryResponse.ok) {
        throw new Error(`Ingestion gateway rejected payload: ${recoveryResponse.status}`);
      }

      return await recoveryResponse.json();
    }
    throw err;
  }
}
