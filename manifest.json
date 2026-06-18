document.getElementById('submitBtn').addEventListener('click', async () => { 
  const scriptInput = document.getElementById('monologueText').value.trim(); 
  const outputDiv = document.getElementById('output'); 
  
  if (!scriptInput) { 
    outputDiv.innerText = "Please paste a monologue first!"; 
    outputDiv.style.color = "#ff4a4a"; 
    return; 
  } 
  
  outputDiv.style.color = "#ccc"; 
  outputDiv.innerText = "StAige is analyzing your text structure..."; 

  try {
    const capabilities = await ai.languageModel.capabilities();
    if (capabilities.available === "no") {
      outputDiv.innerText = "Local AI feature is not enabled or supported on this browser.";
      outputDiv.style.color = "#ff4a4a";
      return;
    }

    const session = await ai.languageModel.create({
      systemPrompt: "You are StAige, an AI acting coach. Analyze the provided monologue text structure."
    });

    const stream = await session.promptStreaming(scriptInput);
    
    for await (const chunk of stream) {
      outputDiv.innerText = chunk; 
    }

    session.destroy();

  } catch (error) {
    outputDiv.innerText = "Error running local text analysis.";
    outputDiv.style.color = "#ff4a4a";
    console.error("StAige Local Processing Error:", error);
  }
});
