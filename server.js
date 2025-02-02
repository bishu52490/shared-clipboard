import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend

const clipboards = {};
const clipboardTimers = {};

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("createClipboard", (content, callback) => {
        const code = uuidv4().slice(0, 6);
        clipboards[code] = content;
        socket.join(code);
        callback(code);

        clipboardTimers[code] = setTimeout(() => {
            delete clipboards[code];
            delete clipboardTimers[code];
        }, 10 * 60 * 1000);
    });

    socket.on("joinClipboard", (code) => {
        if (clipboards[code]) {
            socket.join(code);
            socket.emit("clipboardData", clipboards[code]);
        } else {
            socket.emit("clipboardData", "Clipboard Expired or Invalid Code!");
        }
    });

    socket.on("updateClipboard", (code, content) => {
        if (clipboards[code]) {
            clipboards[code] = content;
            io.to(code).emit("clipboardData", content);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// ✅ Serve the frontend when accessing "/"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
