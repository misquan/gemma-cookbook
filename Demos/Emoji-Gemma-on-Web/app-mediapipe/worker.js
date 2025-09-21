// This demo requires importScripts, so we use a local, pre-built JavaScript bundle.
// This also enables the app to run offline without needing to access a CDN.

importScripts('/mediapipe_genai_bundle.js'); //from npm @mediapipe/tasks-genai@0.10.24

const { FilesetResolver, LlmInference } = self.BundledCode;

let pipe;
// Ensure this filename matches your actual model file.
let modelPath = './gemmoji.task'; 

// Listen for messages from the main thread
self.onmessage = async (event) => {
  const { type, data } = event.data;
  console.log("[Worker] Received message:", { type, data });

  switch (type) {
    case "load":
      try {
        console.log("[Worker] Loading model...");
        // Load the model in the worker thread
        const genaiFileset = await FilesetResolver.forGenAiTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm');
        pipe = await LlmInference.createFromOptions(genaiFileset, {
          baseOptions: {
            modelAssetPath: modelPath
          },
          maxTokens: 32, 
          temperature: .8,
          forceF32: true,
        });
        console.log("[Worker] Model loaded successfully.");
        self.postMessage({ type: "loaded" });
      } catch (error) {
        console.error("[Worker] Error loading model:", error);
        self.postMessage({ type: "error", data: error.message });
      }
      break;

    case "generate":
      if (!pipe) {
        console.error("[Worker] Generation failed: model not loaded yet.");
        self.postMessage({ type: "error", data: "Model not loaded yet." });
        return;
      }
      try {
        const generatedResponses = new Set();
        const prompt = `Translate this text to emoji: ${data.prompt}\nEmoji:`;

        for (let i = 0; i < 3; i++) {
          const modifiedPrompt = prompt + ' '.repeat(i);
          const response = await pipe.generateResponse(modifiedPrompt);
          if (response.trim()) {
            generatedResponses.add(response.trim());
          }
        }
        generatedResponses.forEach(response => {
        self.postMessage({ type: "result", data: response + '\n' });
        });
        self.postMessage({ type: "complete" });
      } catch (error) {
        console.error("[Worker] Error during generation:", error);
        self.postMessage({ type: "error", data: error.message });
      }
      break;
  }
};