let localSession = null;
let conversationHistory = [];

document.getElementById('submitBtn').addEventListener('click', async () => {
    const scriptInput = document.getElementById('monologueText').value.trim();
    const outputDiv = document.getElementById('output');

    if (!scriptInput) {
        outputDiv.innerText = "Please paste a monologue first!";
        outputDiv.style.color = "#ff4a4a";
        return;
    }

    outputDiv.style.color = "#ccc";
    outputDiv.innerText = "Initializing StAige engine...";

    try {
        if (typeof ai !== 'undefined' && ai.languageModel) {
            const capabilities = await ai.languageModel.capabilities();

            if (capabilities.available === "readily") {
                await handleLocalAnalysis(scriptInput, outputDiv);
                return;
            } 
            
            if (capabilities.available === "after-download") {
                outputDiv.innerText = "Downloading StAige local AI components. Please wait...";
                outputDiv.style.color = "#ffa500";
                return;
            }
        }

        outputDiv.innerText = "Local AI unavailable. Routing to StAige Cloud Engine...";
        outputDiv.style.color = "#00d2ff";
        await handleCloudFallback(scriptInput, outputDiv);

        outputDiv.innerText = `StAige System Exception: ${error.message || "Execution blocked."}`;
        outputDiv.style.color = "#ff4a4a";
        console.error("StAige Application Error Tracker:", error);
    }
});

async function handleLocalAnalysis(text, displayElement) {
    if (!localSession) {
        localSession = await ai.languageModel.create({
            systemPrompt: "You are StAige, an AI acting coach. Analyze scripts contextually. Remember past reviews."
        });
    }

    displayElement.innerText = "Analyzing text delivery variables...";
    displayElement.style.color = "#ccc";

    const stream = await localSession.promptStreaming(text);
    displayElement.innerText = ""; 

    for await (const chunk of stream) {
        displayElement.innerText = chunk;
    }
    
    conversationHistory.push({ role: "user", content: text });
    conversationHistory.push({ role: "assistant", content: displayElement.innerText });
}

async function handleCloudFallback(text, displayElement) {
    conversationHistory.push({ role: "user", content: text });

    const response = await fetch('/api/analyze-monologue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstructions: "You are StAige, an AI acting coach.",
            history: conversationHistory,
            currentInput: text
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server communication failure: Status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    displayElement.innerText = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkText = decoder.decode(value, { stream: true });
        displayElement.innerText += chunkText;
    }

    conversationHistory.push({ role: "assistant", content: displayElement.innerText });
}
