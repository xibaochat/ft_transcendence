import { useEffect, useRef, useState } from "react";
import { GameState } from "../type/pongType";
import { Button, CircularProgress, Grid, TextField } from "@mui/material";
import Canvas from "../components/Canvas";
import "../styles/gameStyle.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux";
import { UserState } from "../redux/reducers/userReducers";
import { ColumnGroupingTable } from "../components/ColumnGroupingTable";
import { ResponsiveDialog } from "../components/ResponsiveDialog";
import { useLocation } from "react-router-dom";
import ButtonGroup from "@mui/material/ButtonGroup";
import pongSocketService from "../services/pongSocketService";
import { updateStatusConfirmedAction } from "../redux/actions/userActions";

export const Pong = () => {
    let socket = pongSocketService.connect();

    const [progress, setProgress] = useState(10);
    const [colorBackground, setColorBackground] = useState("white");
    const [difficulty, setDifficulty] = useState("Normal");
    const [but, setBut] = useState("5");
    const [searchOpponent, setSearchOpponent] = useState(
        "Waiting for an opponent"
    );
    // Use a ref to access the Canvas
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<GameState>({
        ballPos: {
            x: 300,
            y: 150,
        },
        ballVel: { x: 10, y: 10 },
        leftPaddle: 150,
        rightPaddle: 150,
        leftScore: 0,
        rightScore: 0,
        roomId: "",
        leftPlayer: "",
        rightPlayer: "",
        canvasWidth: 600,
        canvasHeight: 300,
        paddleWidth: 20,
        paddleHeight: 70,
        ballRadius: 10,
    });
    const [id, setId] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState("");
    const [winnerSide, setWinnerSide] = useState("")
    const userLogin = useSelector<RootState, UserState>(
        (state: RootState) => state.userLogin
    );
    const [rightPlayer, setRightPlayer] = useState("");
    const [leftPlayer, setLeftPlayer] = useState("");
    const [playerSide, setPlayerSide] = useState("");
    const [roomId, setRoomId] = useState("");
    const { userInfo }: UserState = userLogin;
    const { state }: any = useLocation();
    const dispatch = useDispatch();

    socket = pongSocketService.connect();

    useEffect(() => {
        if (userInfo?.status === "looking") {
            setGameStarted(true);
        }
    }, [userInfo?.status]);

    useEffect(() => {
        if (userInfo?.username && state) {
            if (state && state.spectator) {
                if (socket)
                    socket.emit("joinPongRoom", {
                        userId: userInfo?.username,
                        roomId: state.spectator,
                    });
                setRoomId(state.spectator);
            }
            // if (state.spectator === true) {
            // setWinner('')
            // NEED real name of Opponent + realname of PlayerName
            // setOpponent('test')
        }
    }, [socket, state, userInfo?.username]);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prevProgress) =>
                prevProgress >= 30 ? 0 : prevProgress + 10
            );
            if (progress === 0) setSearchOpponent("Waiting for an opponent");
            else setSearchOpponent((prevProgress) => prevProgress + ".");
        }, 800);
        return () => {
            clearInterval(timer);
        };
    }, [progress]);

    if (userLogin.showLoading || !userInfo) {
        return <h1>Loading...</h1>;
    }

    if (!socket) {
        return <h1>Loading...</h1>;
    }

    socket.on("gameState", (...args) => {
        setGameState(args[0]);
        setGameStarted(true);
        setRightPlayer(args[0].rightPlayer);
        setLeftPlayer(args[0].leftPlayer);
        setRoomId(args[0].roomId);
        if (playerSide === "") {
            if (userInfo) {
                if (userInfo.username === args[0].rightPlayer) {
                    setPlayerSide("rightPlayer");
                } else if (userInfo.username === args[0].leftPlayer) {
                    setPlayerSide("leftPlayer");
                } else {
                    setPlayerSide("spectator");
                }
            }
        }
    });

    socket.on("gameOver", (...args) => {
        if (args[0] === "leftPlayer")
            setWinnerSide("leftPlayer");
        else
            setWinnerSide("rightPlayer");
        setWinner(args[1]);
        setGameStarted(false);
        setPlayerSide("");
        endGame();
    });

    const onKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        switch (event.code) {
            case "KeyS" || "ArrowDown":
                socket?.emit("move", { room: roomId, player: playerSide, move: 1 });
                setId(id + 1);
                break;
            case "KeyW" || "ArrowUp":
                socket?.emit("move", { room: roomId, player: playerSide, move: -1 });
                setId(id + 1);
                break;
        }
    };

    function stopSearchingOpponent() {
        if (userInfo) {
            if (socket) socket.emit("iDontWannaPlayAnymore", userInfo.id);
        }
        const storage = localStorage.getItem('userInfo');
        if (storage) {
            const user = JSON.parse(storage);
            user.status = "looking";
            localStorage.setItem('userInfo', JSON.stringify(user));
        }
        dispatch(updateStatusConfirmedAction("online"))
        setGameStarted(false);
    }

    function giveUpPong() {
        if (userInfo) {
            if (socket)
                socket.emit("move", { room: roomId, player: playerSide, move: 0 });
        }
    }

    function handleClick() {
        setWinnerSide("");
        if (userInfo) {
            if (socket)
                socket.emit("lookingForAGame", {
                    userId: userInfo.id,
                    difficulty: difficulty,
                    maxScore: parseInt(but),
                });
            const storage = localStorage.getItem('userInfo');
            if (storage) {
                const user = JSON.parse(storage);
                user.status = "looking";
                localStorage.setItem('userInfo', JSON.stringify(user));
            }
            dispatch(updateStatusConfirmedAction("looking"))
        }

        setGameStarted(true);
        setWinner("");
        setLeftPlayer("");
        setRightPlayer("");
    }

    const endGame = () => {
        socket?.removeAllListeners("gameState");
        socket?.removeAllListeners("gameOver");
        socket?.removeAllListeners("GameInfo");
        socket?.removeAllListeners("GamePlayersName");
        setGameState({
            ballPos: {
                x: gameState.canvasWidth / 2,
                y: gameState.canvasHeight / 2,
            },
            ballVel: { x: 10, y: 10 },
            leftPaddle: gameState.canvasHeight / 2,
            rightPaddle: gameState.canvasHeight / 2,
            leftScore: 0,
            rightScore: 0,
            roomId: roomId,
            leftPlayer: leftPlayer,
            rightPlayer: rightPlayer,
            canvasWidth: 600,
            canvasHeight: 300,
            paddleWidth: 20,
            paddleHeight: 70,
            ballRadius: 10
        });
        const storage = localStorage.getItem('userInfo');
        if (storage) {
            const user = JSON.parse(storage);
            user.status = "online";
            localStorage.setItem('userInfo', JSON.stringify(user));
        }
        dispatch(updateStatusConfirmedAction("online"))
    };

    const drawGame = (ctx: CanvasRenderingContext2D) => {
        var leftWinImg = new Image();
        var rightWinImg = new Image();
        var cyberpongImg = new Image();

        leftWinImg.src = "./game/left_win.jpeg";
        rightWinImg.src = "./game/right_win.jpeg";
        cyberpongImg.src = "./game/cyberpong.jpeg";

        ctx.imageSmoothingEnabled = false;
        if (winnerSide !== "") {
            if (winnerSide === "leftPlayer")
                ctx.drawImage(leftWinImg, 0, 0, gameState.canvasWidth, gameState.canvasHeight);
            else
                ctx.drawImage(rightWinImg, 0, 0, gameState.canvasWidth, gameState.canvasHeight);

        } else if (playerSide === "") {
            ctx.drawImage(cyberpongImg, 0, 0, gameState.canvasWidth, gameState.canvasHeight);
        } else {
            ctx.clearRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);

            ctx.beginPath();
            ctx.fillStyle = colorBackground;
            ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);

            ctx.fillStyle = colorBackground;
            ctx.arc(gameState.ballPos.x, gameState.ballPos.y, 5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = "black";
            ctx.arc(gameState.ballPos.x, gameState.ballPos.y, gameState.ballRadius, 0, 2 * Math.PI);

            ctx.fill();

            ctx.fillStyle = "green";
            ctx.fillRect(0, gameState.leftPaddle - gameState.paddleHeight / 2, gameState.paddleWidth, gameState.paddleHeight);

            ctx.fillStyle = "red";
            ctx.fillRect(gameState.canvasWidth - gameState.paddleWidth, gameState.rightPaddle - gameState.paddleHeight / 2, gameState.paddleWidth, gameState.paddleHeight);

            ctx.fillStyle = "black";
            ctx.font = "16px Palantino";
            ctx.fillText(gameState.rightScore.toString(), gameState.canvasWidth - 100, 50);

            ctx.fillStyle = "black";
            ctx.fillText(gameState.leftScore.toString(), 100, 50);
            ctx.closePath();

            ctx.stroke();
        }
    };

    const manageBut = (but: any) => {
        if (but > 0 && but < 21)
            setBut(but);
    };

    return (
        <div>
            {!gameStarted ? (
                <div>
                    <Grid
                        container
                        direction="column"
                        alignItems="center"
                        justifyContent="space-around"
                        style={{ minHeight: "20vh" }}
                    >
                        <Grid item xs={3}>
                            <ButtonGroup variant="text" aria-label="text button group">
                                <Button onClick={() => setDifficulty("Easy")}>Easy</Button>
                                <Button onClick={() => setDifficulty("Normal")}>Normal</Button>
                                <Button onClick={() => setDifficulty("Hard")}>Hard</Button>
                            </ButtonGroup>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                id="outlined-number"
                                label="Number"
                                type="number"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={but}
                                onChange={(e) => manageBut(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <ButtonGroup variant="text" aria-label="text button group">
                                <Button
                                    style={{ backgroundColor: "white", color: "black" }}
                                    onClick={() => setColorBackground("white")}
                                >
                                    White
                                </Button>
                                <Button
                                    style={{ backgroundColor: "blue", color: "black" }}
                                    onClick={() => setColorBackground("blue")}
                                >
                                    Blue
                                </Button>
                                <Button
                                    style={{ backgroundColor: "purple", color: "black" }}
                                    onClick={() => setColorBackground("purple")}
                                >
                                    purple
                                </Button>
                                <Button
                                    style={{ backgroundColor: "orange", color: "black" }}
                                    onClick={() => setColorBackground("orange")}
                                >
                                    orange
                                </Button>
                                <Button
                                    style={{ backgroundColor: "yellow", color: "black" }}
                                    onClick={() => setColorBackground("yellow")}
                                >
                                    Yellow
                                </Button>
                            </ButtonGroup>
                        </Grid>
                        Background color selected :
                        <div style={{ backgroundColor: colorBackground }}>
                            {colorBackground}
                        </div>
                        Difficulty {difficulty}
                        {winner ? <div>Winner {winner}</div> : null}
                        <Grid item xs={6}>
                            <div>
                                <div
                                    className="gamePong"
                                    tabIndex={0}
                                    onKeyDown={onKeyDownHandler}
                                >
                                    <Canvas
                                        ref={canvasRef}
                                        draw={drawGame}
                                        width={gameState.canvasWidth}
                                        height={gameState.canvasHeight}
                                    />
                                </div>
                                {playerSide ? (
                                    <ColumnGroupingTable
                                        leftPlayer={leftPlayer}
                                        rightPlayer={rightPlayer}
                                    />
                                ) : null}
                            </div>
                        </Grid>
                        <Grid rowSpacing={10}>
                            <Button variant="outlined" onClick={handleClick}>
                                {winner === "" ? (
                                    <div>Search for an opponent</div>
                                ) : (
                                    <div>Play again</div>
                                )}
                            </Button>
                        </Grid>
                        <ResponsiveDialog />
                    </Grid>
                </div>
            ) : (
                <div>
                    {!playerSide ? (
                        <Grid
                            container
                            rowSpacing={10}
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                            style={{ minHeight: "100vh" }}
                        >
                            <CircularProgress size={gameState.canvasWidth / 6} />
                            <Grid item xs={3}>
                                {searchOpponent}
                            </Grid>
                            <Button onClick={stopSearchingOpponent}>
                                Stop searching for a Game
                            </Button>
                        </Grid>
                    ) : (
                        <div>
                            {winner ? <div>Winner : {winner}</div> : null}
                            <div
                                className="gamePong"
                                tabIndex={0}
                                onKeyDown={onKeyDownHandler}
                            >
                                <Canvas
                                    ref={canvasRef}
                                    draw={drawGame}
                                    width={gameState.canvasWidth}
                                    height={gameState.canvasHeight}
                                />
                            </div>
                            <ColumnGroupingTable
                                leftPlayer={leftPlayer}
                                rightPlayer={rightPlayer}
                            />
                            {state ?
                                !state.spectator ?
                                    <Button onClick={giveUpPong}>Give up</Button>
                                    :
                                    null
                                :
                                <Button onClick={giveUpPong}>Give up</Button>
                            }
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};