import { useState } from "react";

import "./App.css";

function App() {
    const [tweetText, setTweetText] = useState<string | null>(null);
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
                        setStatus("Success!");
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

    const copyToClipboard = () => {
        if (tweetText) {
            navigator.clipboard.writeText(tweetText);

            setStatus("Copied!");
        }
    };

    return (
        <div className="container">
            <h1>Text Extractor</h1>

            <div className="card">
                <button onClick={handleExtract}>Extract Tweet</button>
            </div>

            {status && <p className="status">{status}</p>}

            {tweetText && (
                <div className="result-box">
                    <h3>Extracted Text:</h3>
                    <p>{tweetText}</p>
                    <button className="secondary" onClick={copyToClipboard}>
                        Copy Text
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
