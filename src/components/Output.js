import React, { useState } from 'react'
import axios from 'axios'

const Output = ({ code }) => {
    const [output, setOutput] = useState("")
    const [language, setLanguage] = useState('63')

    const runCode = async () => {
        console.log("Code received in Output:", code);

        if (!code || code.trim() === "") {
            setOutput("No code provided");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/run', {
                source_code: code,
                language_id: 63,  // Node.js
                stdin: "",
            });


            setOutput(
                response.data.stdout?.trim()
                || response.data.stderr?.trim()
                || "No output or error returned"
            );

        } catch (error) {
            console.log(error);
            setOutput("Execution error");
        }
    };

    return (
        <div className="outputWrap">
            <button className="btn runButton" onClick={runCode}>
                Run
            </button>
            <label>Choose a language: </label>
            <select
                className='btn languages'
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
            >
                <option value='62'>Java</option>
                <option value='71'>Python</option>
                <option value='63'>JavaScript</option>
                <option value='54'>C++</option>
                <option value='50'>C</option>
            </select>
            &nbsp;
            <textarea id="outputBlock" value={output} readOnly></textarea>
        </div>
    )
}

export default Output
