// This demo requires importScripts, so we use a local, pre-built JavaScript bundle.

importScripts('/mediapipe_genai_bundle.js'); // from npm @mediapipe/tasks-genai@0.10.24

const { FilesetResolver, LlmInference } = self.BundledCode;

let pipe;
let modelPath = './myemoji-gemma-3-270m-it.task'; // Ensure this filename matches your actual model file.

const START_TURN_USER = "<start_of_turn>user\n";
const END_TURN_USER = "<end_of_turn>\n";
const START_TURN_MODEL = "<start_of_turn>model\n";

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
        const prompt = `${START_TURN_USER}Translate this text to emoji: ${data.prompt}${END_TURN_USER}${START_TURN_MODEL}`;

        for (let i = 0; i < 3; i++) {
          const modifiedPrompt = prompt + ' '.repeat(i);
          const rawResponse = await pipe.generateResponse(modifiedPrompt);
          const cleanResponse = rawResponse.replace(/[^\p{Emoji}\s]/gu, '').trim();
          if (cleanResponse) {
            generatedResponses.add(cleanResponse);
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
