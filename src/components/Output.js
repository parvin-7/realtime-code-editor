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
                language_id: language,
                stdin: "",
            });


            setOutput(
                response.data.stdout?.trim() ||
                response.data.stderr?.trim() ||
                response.data.compile_output?.trim() ||
                JSON.stringify(response.data) ||
                "No output or error returned"
            );


        } catch (error) {
            console.log(error);
            setOutput("Execution error");
        }
    };

    return (

        <div className="outputWrap">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <button className="btn runButton" onClick={runCode}>Run</button>
                <label htmlFor="languages">Choose Language:</label>
                <select
                    id="languages"
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
            </div>
            <label id='labelOutput' htmlFor="outputBlock">Output:</label>
            <textarea id="outputBlock" value={output} readOnly />
        </div>

    )
}

export default Output
