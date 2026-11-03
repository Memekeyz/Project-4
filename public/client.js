// Author: Ryan Hong 
// Introduction to Web Development: Project 4
// Tic-Tac-Toe

const boardCanvas = document.getElementById('board');
const ctx = boardCanvas.getContext('2d');
const statusElement = document.getElementById('status');
const roleElement = document.getElementById('role');
const resetBtn = document.getElementById('resetBtn');
const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('nameInput');
const passwordInput = document.getElementById('passwordInput');

const CELL_SIZE = 200;
const ws = new WebSocket(`ws://${window.location.host}`);
let gameState = null;
let role = "spectator";

boardCanvas.addEventListener('click', event => {
    if (role !== "X" && role !== "O") {
        return;
    }

    const rect = boardCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    const index = row * 3 + col;
    ws.send(JSON.stringify({ type: "place", index}));

});

function drawGrid() {
        ctx.lineWidth = 4;
        ctx.beginPath();

        ctx.moveTo(200, 0);
        ctx.lineTo(200, 600);

        ctx.moveTo(400, 0);
        ctx.lineTo(400, 600);
    
        ctx.moveTo(0, 200);
        ctx.lineTo(600, 200);

        ctx.moveTo(0, 400);
        ctx.lineTo(600, 400);
    
        ctx.stroke();
}

function drawX(x, y) {
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 30);
    ctx.lineTo(x + 170, y + 170);
    ctx.moveTo(x + 170, y + 30);
    ctx.lineTo(x + 30, y + 170);
    ctx.stroke();
}

function drawO(x, y) {
    ctx.beginPath();
    ctx.arc(x + 100, y + 100, 70, 0, Math.PI * 2);
    ctx.stroke();
}

function drawBoard() {
    ctx.clearRect(0, 0, 600, 600);
    drawGrid();
    
    gameState.board.forEach((value, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        if (value === "X") {
            drawX(x, y);
        } else if (value === "O") {
            drawO(x, y);
        }
    });

    if (gameState.winner) {
        statusElement.textContent = `Winner: ${gameState.winner}`;
    } else {
        statusElement.textContent = `Current Turn: ${gameState.currentPlayer}`;
    }
}

ws.onmessage = event => {
    const data = JSON.parse(event.data);

    if (data.type === "state") {
        gameState = data.gameState;
        drawBoard();
    }

    if (data.type === "role") {
        role = data.role;
        roleElement.textContent = `Logged in as ${data.name} (${role})`;
    }

    if (data.type === "error") {
        alert(data.message);
    }
};

joinBtn.addEventListener("click", () => {
    ws.send(JSON.stringify({type: "login", name: nameInput.value.trim(),
        password: passwordInput.value}));
    }
);

resetBtn.addEventListener("click", () => {
    ws.send(JSON.stringify({type: "reset"}));
    }
);
