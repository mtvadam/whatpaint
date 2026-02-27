'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  FilesetResolver,
  ImageSegmenter,
} from '@mediapipe/tasks-vision';

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite';

export type SegmentationResult = {
  categoryMask: Uint8Array;
  width: number;
  height: number;
};

export function useImageSegmenter() {
  const segmenterRef = useRef<ImageSegmenter | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initSegmenter = useCallback(async () => {
    // Prevent double-init
    if (segmenterRef.current || initPromiseRef.current) return;

    const promise = (async () => {
      setIsLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
        const segmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          outputCategoryMask: true,
          outputConfidenceMasks: false,
          runningMode: 'VIDEO',
        });
        segmenterRef.current = segmenter;
        setIsReady(true);
      } catch (err) {
        console.error('Failed to load AI segmentation model:', err);
        setError(err instanceof Error ? err.message : 'Failed to load AI model');
      } finally {
        setIsLoading(false);
      }
    })();

    initPromiseRef.current = promise;
    await promise;
  }, []);

  const segmentFrame = useCallback(
    (video: HTMLVideoElement, timestampMs: number): SegmentationResult | null => {
      const segmenter = segmenterRef.current;
      if (!segmenter) return null;

      try {
        const result = segmenter.segmentForVideo(video, timestampMs);
        if (!result.categoryMask) return null;

        const maskData = result.categoryMask.getAsUint8Array();
        const width = result.categoryMask.width;
        const height = result.categoryMask.height;

        // Copy the data - MediaPipe reuses the underlying buffer
        const categoryMask = new Uint8Array(maskData);

        result.close();

        return { categoryMask, width, height };
      } catch {
        return null;
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      segmenterRef.current?.close();
      segmenterRef.current = null;
    };
  }, []);

  return { isLoading, isReady, error, initSegmenter, segmentFrame };
}
