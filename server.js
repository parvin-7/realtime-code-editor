const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const axios = require('axios')
const cors = require('cors')
require("dotenv").config()

const server = http.createServer(app)
const io = new Server(server)

const ACTIONS = require('./src/Actions')
const path = require('path')

app.use(express.json())
app.use(cors())

app.use(express.static('build'))
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions";


const API_KEY = process.env.JUDGE0_API_KEY

app.post('/run', async (req, res) => {
    const { language_id, source_code, stdin } = req.body;
    console.log("Backend received:", { language_id, source_code, stdin });

    try {
        const { data } = await axios.post(
            `${JUDGE0_API_URL}?base64_encoded=false&wait=true`,
            {
                language_id,
                source_code,
                stdin: stdin || "",
            },
            {
                headers: {
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                    "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Judge0 Response:", data); // <--- Check if this contains stdout
        res.json({
            stdout: data.stdout,
            stderr: data.stderr,
            status: data.status?.description || "Unknown Status",
        });
    } catch (error) {
        console.error("Execution failed:", error.response?.data || error.message);
        res.status(500).json({ error: "Execution failed" });
    }
});



const userSocketMap = {}

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId => {
        return {
            socketId,
            username: userSocketMap[socketId],
        }
    })
}

io.on('connection', (socket) => {
    console.log('Socket connected', socket.id)

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username
        socket.join(roomId)
        const clients = getAllConnectedClients(roomId)

        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id
            })
        })
    })

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code })
    })

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        if (code !== null) {
            io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code })
        }
    })

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms]
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            })
        })
        delete userSocketMap[socket.id]
        socket.leave()
    })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
