const difficulties = {
    EASY: 'Easy',
    MEDIUM: 'Medium'
}
let difficulty = difficulties.EASY;
let mineMatrix = [];
let width = 0;
let height = 0;
let nMines = 0;
let firstClick = false;
let nCorrectTiles = 0;
let tilesPressed = 0;
let gameOver = false;
let timerCount = 0;
let nMarkedMines = 0;
const timerText = document.getElementById("timer");
const mineText = document.getElementById("mine-text");

const playAgainButton = document.getElementById("play-again");
playAgainButton.addEventListener('click', () => initialize());

let initialize = () => {
    firstClick = false;
    tilesPressed = 0;
    timerCount = 0;
    nMarkedMines = 0;
    timerText.textContent = "0:00";
    gameOver = false;
    switch (difficulty) {
        case difficulties.EASY:
            width = 10;
            height = 8;
            nMines = 10;
            break;
        case difficulties.MEDIUM:
            width = 18;
            height = 14;
            nMines = 40;
            break;
        default:
    }
    nCorrectTiles = (width * height) - nMines;
    let endBanner = document.getElementById('end-banner');
    endBanner.style.visibility = 'hidden';
    mineText.innerHTML = nMines;
    populateGrid();
}
initialize();

function populateGrid() {

    const grid = document.querySelector(".grid");

    while (grid.hasChildNodes()) {
        grid.removeChild(grid.firstChild);
    }

    grid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${height}, 1fr)`;
    if (difficulty == difficulties.EASY) {
        grid.style.gridGap = "1%"
    }
    else {
        grid.style.gridGap = "0.5%";
    }
    grid.style.pointerEvents = "all";

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let tile = generateTile(i, j);
            grid.appendChild(tile);
        }
    }
}

function generateMines(first_i, first_j) {
    mineMatrix = new Array(width).fill(false).map(() => new Array(height).fill(false));

    let nMinesPlaced = 0;
    while (nMinesPlaced < nMines) {
        let i = getRandomInt(height);
        let j = getRandomInt(width);

        if (mineMatrix[i][j] == false && (i != first_i && j != first_j)) {
            mineMatrix[i][j] = true;
            nMinesPlaced++;
        }
    }
}

document.addEventListener('contextmenu', e => e.preventDefault());

let longHoldTimer;
let touchDuration = 750;

function generateTile(i, j) {
    const tile = document.createElement("button");
    tile.className = "tile unpressed";
    tile.id = `${i},${j}`;

    if (difficulty == difficulties.EASY) {
        tile.style.fontSize = "2vh";
        tile.style.borderRadius = "5%";
    }
    else {
        tile.style.fontSize = "1.5vh";
        tile.style.borderRadius = "3%";
    }

    tile.addEventListener("mouseup", (e) => {
        if (longHoldTimer) {
            clearTimeout(longHoldTimer);
            longHoldTimer = null;
        }

        if (e.which === 1) {
            clickTile(tile, i,j);
        }

        else if (e.which === 3) {
            markMine(tile);
        }
    });

    tile.addEventListener("mousedown", (e) => {
        if (!longHoldTimer && e.which === 1) {
            longHoldTimer = setTimeout(() => markMine(tile), touchDuration);
        }
    });

    return tile;
}

function markMine(tile) {
    if (tile.classList.contains('marked')) {
        // unmark
        nMarkedMines--;
        mineText.textContent = nMines - nMarkedMines;
        tile.classList.remove(['marked']);
        tile.textContent = "";
    }
    else if (!tile.classList.contains('pressed')){
        // mark
        nMarkedMines++;
        mineText.textContent = nMines - nMarkedMines;
        tile.classList.add(['marked']);
        tile.innerHTML = `<i class="fas fa-flag"></i>`;
    }
}

function clickTile(element, i, j) {
    if (element.classList.contains('marked')){
        return;
    }

    if (!firstClick) {
        generateMines(i, j);
        firstClick = true;
    }

    if (mineMatrix[i][j] == true) {
        displayEnd(false);
    }

    else {
        calculateAdjacentMines(i, j);
    }
}

function calculateAdjacentMines(i, j) {
    let tile = document.getElementById(`${i},${j}`);
    if (tile.classList.contains("pressed")) {
        return;
    }
    let count = 0;
    for (let x = i - 1; x < i + 2; x++) {
        for (let y = j - 1; y < j + 2; y++) {
            if (x == i && y == j)
                continue;
            if ((x >= 0 && x < height) && (y >= 0 && y < width) &&
                mineMatrix[x][y] == true) {
                count++;
            }
        }
    }

    if (count == 0) {
        removeMarkIfNeeded(tile)
        tile.className = "tile pressed";
        tile.textContent = "";
        for (let x = i - 1; x < i + 2; x++) {
            for (let y = j - 1; y < j + 2; y++) {
                if (x == i && y == j)
                    continue;
                if ((x >= 0 && x < height) && (y >= 0 && y < width)) {
                    calculateAdjacentMines(x, y);
                }
            }
        }
    }
    else {
        removeMarkIfNeeded(tile)
        tile.textContent = count;
        tile.className = "tile pressed";
        if (count === 1)
            tile.classList.add("green");
        else if (count === 2)
            tile.classList.add("blue");
        else
            tile.classList.add("red");
    }
    tilesPressed++;

    if (tilesPressed == nCorrectTiles) {
        displayEnd(true);
    }
}

function removeMarkIfNeeded(element){
    if (element.classList.contains("marked")) {
        nMarkedMines--;
        mineText.textContent = nMines-nMarkedMines;
    }
}

function displayEnd(win) {
    gameOver = true;
    const grid = document.querySelector(".grid");
    grid.style.pointerEvents = "none";
    let endBanner = document.getElementById('end-banner');
    let endTitle = document.getElementById('end-title');
    if (win) {
        endTitle.textContent = "You Win"
    }
    else {
        endTitle.textContent = "You Lose"
    }
    endBanner.style.visibility = "visible"
    showMines();
}

function showMines() {
    const tiles = document.getElementsByClassName("tile");
    for (let tile of tiles) {
        [i, j] = tile.id.split(',');
        if (mineMatrix[i][j]) {
            tile.className = 'tile mine'
            tile.innerHTML = `<i class="fas fa-bomb"></i>`;
        }
    }
}

// Gets a random number between 0 and max but not including max
function getRandomInt(max) {
    return Math.floor((Math.random() * max))
}

setInterval(increaseClock, 1000);

function increaseClock() {
    if (gameOver)
        return;
    timerText.textContent = intToTimer(timerCount++);
}

function intToTimer(seconds_in) {
    var minutes = Math.floor(seconds_in / 60);
    var seconds = seconds_in - (minutes * 60);

    if (minutes < 10 && minutes > 0)
        minutes = "0" + minutes;
    if (seconds < 10)
        seconds = "0" + seconds;
    return minutes + ':' + seconds;
}

const diffText = document.getElementById("difficulty");
const easyButton = document.getElementById("Easy");
easyButton.addEventListener("click", () => {
    changeDifficulty(difficulties.EASY);
});

const mediumButton = document.getElementById("Medium");
mediumButton.addEventListener("click", () => {
    changeDifficulty(difficulties.MEDIUM);
});

function changeDifficulty(d) {
    if (difficulty == d)
        return;
    difficulty = d;
    diffText.innerHTML = d;
    initialize();
}