const searchBox = document.getElementById("search-box");
const btn = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const mic = document.getElementById("microphone-icon"); 
const answer = document.getElementById("answer"); // Moved up for global access

// 1. Support check and setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false; 

if (SpeechRecognition) {
    recognition = new SpeechRecognition();

    // 2. Configure settings
    recognition.lang = 'en-US'; 
    recognition.interimResults = false;
    recognition.continuous = false; 

    // 3. Handle when the microphone starts listening
    recognition.onstart = () => {
        isListening = true;
        console.log("Listening...");
        searchInput.value = ""; 
        searchInput.placeholder = "Listening...";
        searchBox.classList.add("dive-down"); 
    };

    // 4. Handle the processed audio result
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("What you said:", transcript);
        searchInput.value = transcript; 
        
    };

    // 5. Handle when listening stops naturally or manually
    recognition.onend = () => {
        isListening = false;
        searchInput.placeholder = "Ask me anything..."; 
        searchBox.classList.remove("dive-down"); 
    };

    // 6. Handle errors 
    recognition.onerror = (event) => {
        isListening = false;
        console.error("Speech recognition error:", event.error);
        
        searchInput.placeholder = "Ask me anything...";
        searchBox.classList.remove("dive-down");
        
        if (event.error === 'not-allowed') {
            alert("Please allow microphone access to use voice search.");
        }
    };
} else {
    console.log("Sorry, your browser does not support speech recognition.");
}




// 7. Microphone Click
mic.addEventListener("click", () => {
    if (!recognition) {
        alert("Voice search is not supported on this browser.");
        return;
    }

    if (isListening) {
        recognition.stop(); 
    } else {
        try {
            recognition.start();
        } catch (e) {
            console.log("Recognition failed to start:", e);
        }
    }
});




async function executeSearch(query) {
    if (!query) return;

    console.log(`Executing search for: ${query}`);
    if (answer) answer.textContent = "Thinking..."; 

    try {
        // Send a POST request to your backend server endpoint
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: query })
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }

        // Parse the JSON response from the server
        const data = await response.json();

        // Update the answer element with the response text
        if (answer) {
            answer.textContent = data.text;
        }

        console.log("--- Success! ---");
        console.log(data.text);   

    } catch (error) {
        console.error("Fetch Error:", error);
        if (answer) answer.textContent = "Sorry, something went wrong. Please try again.";
    }
}








// Handle Click on search button
btn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    executeSearch(query);
});

// Handle Enter key for search input field
searchInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        const inputValue = searchInput.value.trim();
        executeSearch(inputValue);
    }
});




const history = answer.textContent;

