import { useRef, useState, useEffect, useCallback } from "react";
import {
  InferenceSession,
  Tensor,
} from "onnxruntime-react-native";

export interface UseONNXModelResult {
  runInference: (
    inputTensor: Float32Array,
    shape: number[]
  ) => Promise<Float32Array>;
  isReady: boolean;
  error: string | null;
}

export function useONNXModel(
  modelAssetPath: string
): UseONNXModelResult {
  const sessionRef = useRef<typeof InferenceSession extends { new(...args: infer P): infer R } ? R : null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const asset = require(`../../assets/${modelAssetPath}`);
        const session = await InferenceSession.create(asset as any, {
          executionProviders: [
            { name: "coreml", useCPUOnly: false },
            { name: "nnapi", useFP16: true },
            { name: "cpu" },
          ],
          graphOptimizationLevel: "all",
          intraOpNumThreads: 2,
        });

        if (!cancelled) {
          sessionRef.current = session as any;
          setIsReady(true);
          setError(null);
        } else {
          session.release();
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Failed to load model";
          setError(msg);
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
      if (sessionRef.current) {
        (sessionRef.current as any).release?.();
        sessionRef.current = null;
      }
    };
  }, [modelAssetPath]);

  const runInference = useCallback(
    async (
      inputTensor: Float32Array,
      shape: number[]
    ): Promise<Float32Array> => {
      const session: any = sessionRef.current;
      if (!session) {
        throw new Error("ONNX session not ready");
      }

      const feeds: Record<string, any> = {
        [session.inputNames[0]]: new Tensor(
          "float32",
          inputTensor,
          shape
        ),
      };

      const results = await session.run(feeds);
      const outputName = session.outputNames[0];
      const outputTensor = results[outputName];
      return outputTensor.data as Float32Array;
    },
    []
  );

  return { runInference, isReady, error };
}
