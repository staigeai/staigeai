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
    outputDiv.innerText = "Checking local StAige AI capabilities..."; 
    
    try { 
        if (typeof ai === 'undefined' || !ai.languageModel) {
            throw new Error("Chrome Local AI is not supported on this browser version or flags are disabled.");
        }

        const capabilities = await ai.languageModel.capabilities(); 
        
        if (capabilities.available === "no") {
            throw new Error("Local AI is explicitly disabled or unsupported on this specific hardware.");
        }

        if (capabilities.available === "after-download") { 
            outputDiv.innerText = "Downloading local AI components into Chrome. Please wait a minute and try again..."; 
            outputDiv.style.color = "#ffa500"; 
            return; 
        } 

        outputDiv.innerText = "Analyzing monologue delivery variables..."; 
        outputDiv.style.color = "#ccc"; 
        await handleLocalAnalysis(scriptInput, outputDiv); 

    } catch (error) {
        outputDiv.innerText = `StAige System Exception: ${error.message || "Execution blocked."}`; 
        outputDiv.style.color = "#ff4a4a"; 
        console.error("StAige Local Execution Error:", error); 
    }
}); 

async function handleLocalAnalysis(text, displayElement) { 
    try {
        if (!localSession) { 
            localSession = await ai.languageModel.create({ 
                systemInstruction: "You are StAige, an AI acting coach. Analyze user monologues contextually and give constructive feedback on emotion, pacing, and character portrayal." 
            }); 
        } 
        
        displayElement.innerText = ""; 
        displayElement.style.color = "#f0f6fc";
        
        const stream = await localSession.promptStreaming(text); 
        
        for await (const chunk of stream) { 
            displayElement.innerText = chunk; 
        } 
        
        conversationHistory.push({ role: "user", content: text }); 
        conversationHistory.push({ role: "assistant", content: displayElement.innerText }); 
        
    } catch (localError) {
        localSession = null; 
        throw new Error(`Local model execution failure: ${localError.message}`);
    }
}

window.addEventListener('unload', () => {
    if (localSession) {
        localSession.destroy();
        localSession = null;
    }
});
