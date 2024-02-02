import './App.css';

import React, { useEffect, useState } from "react";

import { FaFlag, FaBomb } from "react-icons/fa";

const colorClasses = {
    1: "text-blue-500",
    2: "text-green-500",
    3: "text-red-500",
    4: "text-purple-500",
    5: "text-yellow-500",
    6: "text-pink-500",
    7: "text-blue-900",
    8: "text-gray-500",
};

function createEmptyGrid(width, height, numBombs) {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, () => ({
            value: 0,
            isRevealed: false,
            isFlagged: false,
            isBomb: false,
        }))
    );
}

function createGrid(width, height, numBombs, avoidX, avoidY) {
    let grid = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => ({
            value: 0,
            isRevealed: false,
            isFlagged: false,
            isBomb: false,
        }))
    );

    // Make random cells flagged
    for (let i = 0; i < numBombs; i++) {
        const x = Math.floor(Math.random() * height);
        const y = Math.floor(Math.random() * width);
        if (grid[x][y].isBomb || (x === avoidX && y === avoidY)) {
            i--;
            continue;
        }
        grid[x][y].isBomb = true;
    }

    // Set the value of each cell to the number of bombs around it
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (grid[i][j].isBomb) {
                if (i > 0) {
                    grid[i - 1][j].value += 1;
                    if (j > 0) grid[i - 1][j - 1].value += 1;
                    if (j < width - 1) grid[i - 1][j + 1].value += 1;
                }
                if (i < height - 1) {
                    grid[i + 1][j].value += 1;
                    if (j > 0) grid[i + 1][j - 1].value += 1;
                    if (j < width - 1) grid[i + 1][j + 1].value += 1;
                }
                if (j > 0) grid[i][j - 1].value += 1;
                if (j < width - 1) grid[i][j + 1].value += 1;
            }
        }
    }

    return grid;
}


function App() {
    const width = 20;
    const height = 10;

    const [startGame, setStartGame] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [numBombs, setNumBombs] = useState(width*height/5);
    const [grid, setGrid] = useState(createEmptyGrid(width, height, numBombs));


    const flagCell = (x, y) => {
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row) => row.slice()); // Create a shallow copy of the grid
            newGrid[x][y] = { ...newGrid[x][y], isFlagged: !newGrid[x][y].isFlagged };
            return newGrid;
        });
    };

    const revealCell = (x, y) => {
        if (startGame) {
            setGrid(createGrid(width, height, numBombs, x, y));
            setStartGame(false);
        }

        if (grid[x][y].isRevealed) return;
        setGrid((prevGrid) => {
            const newGrid = [...prevGrid];
            // If the cell is a bomb, game over
            if (newGrid[x][y].isBomb) {
                // Remove all flags
                for (let i = 0; i < height; i++) {
                    for (let j = 0; j < width; j++) {
                        if (newGrid[i][j].isFlagged) newGrid[i][j].isFlagged = false;
                    }
                }
                setGameOver(true);
                return newGrid;
            }
            // If the cell value is 0, reveal all zero cells until none are left in the queue
            if (newGrid[x][y].value === 0) {
                const queue = [{ x, y }];
                while (queue.length > 0) {
                    const { x, y } = queue.shift();
                    if (newGrid[x][y].isRevealed) continue;
                    newGrid[x][y] = { ...newGrid[x][y], isRevealed: true };
                    if (newGrid[x][y].value === 0) {
                        if (x > 0) queue.push({ x: x - 1, y });
                        if (x < height - 1) queue.push({ x: x + 1, y });
                        if (y > 0) queue.push({ x, y: y - 1 });
                        if (y < width - 1) queue.push({ x, y: y + 1 });
                        if (x > 0 && y > 0) queue.push({ x: x - 1, y: y - 1 });
                        if (x > 0 && y < width - 1) queue.push({ x: x - 1, y: y + 1 });
                        if (x < height - 1 && y > 0) queue.push({ x: x + 1, y: y - 1 });
                        if (x < height - 1 && y < width - 1) queue.push({ x: x + 1, y: y + 1 });
                    }
                }
            }
            else {
                newGrid[x][y] = { ...newGrid[x][y], isRevealed: true };
            }
            return newGrid;
        });
    };

    // Function callback on click flag is right click, reveal is left click
    const handleClick = (event, x, y) => {
        console.log(event.button, x, y);
        event.preventDefault();
        if (event.button === 0) {
            revealCell(x, y);
        } else if (event.button === 2) {
            if (!grid[x][y].isRevealed) flagCell(x, y);
        }
    };

    const handleDoubleClick = (x, y) => {
        // Reveal all cells around the cell if the number of flagged cells around it is equal to its value
        if (grid[x][y].isRevealed && grid[x][y].value > 0) {
            let numFlags = 0;
            if (x > 0) {
                if (grid[x - 1][y].isFlagged) numFlags++;
                if (y > 0 && grid[x - 1][y - 1].isFlagged) numFlags++;
                if (y < width - 1 && grid[x - 1][y + 1].isFlagged) numFlags++;
            }
            if (x < height - 1) {
                if (grid[x + 1][y].isFlagged) numFlags++;
                if (y > 0 && grid[x + 1][y - 1].isFlagged) numFlags++;
                if (y < width - 1 && grid[x + 1][y + 1].isFlagged) numFlags++;
            }
            if (y > 0 && grid[x][y - 1].isFlagged) numFlags++;
            if (y < width - 1 && grid[x][y + 1].isFlagged) numFlags++;
            if (numFlags === grid[x][y].value) {
                if (!grid[x - 1][y].isFlagged && x > 0) revealCell(x - 1, y);
                if (!grid[x + 1][y].isFlagged && x < height - 1) revealCell(x + 1, y);
                if (!grid[x][y - 1].isFlagged && y > 0) revealCell(x, y - 1);
                if (!grid[x][y + 1].isFlagged && y < width - 1) revealCell(x, y + 1);
                if (!grid[x - 1][y - 1].isFlagged && x > 0 && y > 0) revealCell(x - 1, y - 1);
                if (!grid[x - 1][y + 1].isFlagged && x > 0 && y < width - 1) revealCell(x - 1, y + 1);
                if (!grid[x + 1][y - 1].isFlagged && x < height - 1 && y > 0) revealCell(x + 1, y - 1);
                if (!grid[x + 1][y + 1].isFlagged && x < height - 1 && y < width - 1) revealCell(x + 1, y + 1);
            }
        }
    };

    // Check if the game is won
    useEffect(() => {
        let numRevealed = 0;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (grid[i][j].isRevealed) numRevealed++;
            }
        }
        if (numRevealed === width * height - numBombs) setGameWon(true);
    }, [grid, height, width, numBombs]);

    return (
        <div className={`${!gameOver ? "bg-gray-800" : "bg-red-700"} h-screen`}>
            <header className="p-4 text-center">
                <h1 className="text-3xl font-bold text-white">
                    MineSweeper
                </h1>
            </header>
            <table className="mx-auto my-8 border-2 border-gray-900 border-double">
                <tbody>
                    {grid.map((row, i) => (
                        <tr key={i} className="">
                            {row.map((cell, j) => (
                                <td key={j} className="p-0">
                                    <button
                                        className={`w-12 h-12 ${cell.isRevealed ? "bg-gray-300" : "bg-gray-400"} text-black text-sm border border-gray-600 hover:border-yellow-400 hover:border-2 focus:outline-none active:border-orange-500 flex items-center justify-center`}
                                        onClick={(event) => handleClick(event, i, j)}
                                        onDoubleClick={() => handleDoubleClick(i, j)}
                                        onContextMenu={(event) => handleClick(event, i, j)}
                                    >
                                        {gameOver && cell.isBomb && <FaBomb className="text-2xl" />}
                                        {cell.isFlagged && <FaFlag className="text-2xl text-red-600" />}
                                        {!cell.isBomb && cell.isRevealed && cell.value > 0 && <span className={`${colorClasses[cell.value]} text-2xl font-bold`}>
                                            {cell.value}
                                        </span>}
                                    </button>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Popup YOU LOST */}
            {gameOver && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-8 rounded-lg text-center">
                    <h2 className="text-3xl font-bold text-red-600">YOU LOST</h2>
                    <button
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
                        onClick={() => {
                            setGrid(createGrid(width, height, numBombs));
                            setGameOver(false);
                        }}
                    >
                        Restart
                    </button>
                </div>
            </div>}

            {/* Popup YOU WON */}
            {gameWon && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-8 rounded-lg text-center">
                    <h2 className="text-3xl font-bold text-green-600">YOU WON</h2>
                    <button
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
                        onClick={() => {
                            setGrid(createGrid(width, height, numBombs));
                            setGameWon(false);
                        }}
                    >
                        Restart
                    </button>
                </div>
            </div>}
        </div>
    );
}

export default App;
