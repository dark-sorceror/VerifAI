import { useState } from "react";

import "./App.css";

interface AnalysisResult {
    score: number;
    reasoning: string;
    sources: string[] | string;
}

function App() {
    const [tweetText, setTweetText] = useState<string | null>(null);
    
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [status, setStatus] = useState<string>("Ready to extract");

    const getTweetFromPage = () => {
        const tweetElement = document.querySelector<HTMLElement>(
            '[data-testid="tweetText"]',
        );

        return tweetElement ? tweetElement.innerText : null;
    };

    const handleExtract = async () => {
        setStatus("Extracting...");
        setTweetText(null);
        setAnalysis(null);

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (!tab.id) {
            setStatus("Error: No active tab found.");

            return;
        }

        chrome.scripting.executeScript<[], string | null>(
            {
                target: { tabId: tab.id },
                func: getTweetFromPage,
            },
            (results) => {
                if (results && results.length > 0) {
                    const result = results[0].result;

                    if (result) {
                        setTweetText(result);
                        setStatus("Tweet extracted! Ready to verify.");
                    } else {
                        setTweetText(null);
                        setStatus("No tweet text found.");
                    }
                } else {
                    setStatus("Script execution failed.");
                }
            },
        );
    };

    const handleAnalyze = async () => {
        if (!tweetText) return;

        setIsLoading(true);
        setStatus("Analyzing with AI...");

        try {
            const response = await fetch("https://seal-app-d2359.ondigitalocean.app//analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: tweetText }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            setAnalysis(data);
            setStatus("Analysis complete!");
        } catch (error) {
            console.error(error);

            setStatus("Error connecting to server.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (tweetText) {
            navigator.clipboard.writeText(tweetText);

            setStatus("Copied!");
        }
    };

    return (
        <div className="container">
            <h1>AI Truth Checker</h1>

            <div className="card">
                <button onClick={handleExtract} disabled={isLoading}>
                    1. Extract Tweet
                </button>
            </div>

            {tweetText && (
                <div className="result-box">
                    <h3>Extracted Text:</h3>
                    <p style={{ fontStyle: "italic", fontSize: "0.9em" }}>
                        "{tweetText.substring(0, 100)}..."
                    </p>
                    
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button 
                            className="secondary" 
                            onClick={copyToClipboard}
                        >
                            Copy Text
                        </button>
                        
                        <button 
                            style={{ backgroundColor: "#4285F4", color: "white" }}
                            onClick={handleAnalyze}
                            disabled={isLoading}
                        >
                            {isLoading ? "Analyzing..." : "2. Verify with AI"}
                        </button>
                    </div>
                </div>
            )}

            {analysis && (
                <div className="analysis-box" style={{ 
                    marginTop: "20px", 
                    padding: "15px", 
                    border: "1px solid #ccc", 
                    borderRadius: "8px", 
                    textAlign: "left",
                    backgroundColor: analysis.score > 70 ? "#e6fffa" : "#fffce6"
                }}>
                    <h2>Trust Score: {analysis.score}/100</h2>
                    <p><strong>Reasoning:</strong> {analysis.reasoning}</p>
                    
                    <h4>Sources:</h4>
                    <ul>
                        {Array.isArray(analysis.sources) ? (
                            analysis.sources.map((source, i) => (
                                <li key={i}>
                                    <a href={source} target="_blank" rel="noopener noreferrer">
                                        {source}
                                    </a>
                                </li>
                            ))
                        ) : (
                            <li>{analysis.sources}</li>
                        )}
                    </ul>
                </div>
            )}

            {status && <p className="status">{status}</p>}
        </div>
    );
}

export default App;