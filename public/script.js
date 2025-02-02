const socket = io();

document.getElementById("createClipboard").addEventListener("click", () => {
    const content = document.getElementById("clipboardContent").value;
    if (!content.trim()) return alert("Clipboard is empty!");

    socket.emit("createClipboard", content, (code) => {
        document.getElementById("clipboardCode").innerText = "Clipboard Code: " + code;
        document.getElementById("copyClipboardCode").style.display = "block";
        document.getElementById("copyClipboardCode").setAttribute("data-code", code);
    });
});

document.getElementById("joinClipboard").addEventListener("click", () => {
    const code = document.getElementById("clipboardCodeInput").value;
    if (!code.trim()) return alert("Enter a valid code!");

    socket.emit("joinClipboard", code);
});

socket.on("clipboardData", (data) => {
    document.getElementById("clipboardContent").value = data;
});

document.getElementById("copyClipboardCode").addEventListener("click", function () {
    const code = this.getAttribute("data-code");
    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
        alert("Clipboard code copied: " + code);
    }).catch(err => {
        console.error("Failed to copy:", err);
    });
});

document.getElementById("clipboardContent").addEventListener("input", () => {
    const code = document.getElementById("clipboardCode").innerText.split(": ")[1];
    if (code) {
        socket.emit("updateClipboard", code, document.getElementById("clipboardContent").value);
    }
});
