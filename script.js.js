document.addEventListener('DOMContentLoaded', () => {
    const gameBoardContainer = document.querySelector('.game-board-container');
    const rollDiceButton = document.getElementById('roll-dice-button');
    const diceResultDisplay = document.getElementById('dice-result');
    const currentPlayerDisplay = document.getElementById('current-player');
    const eventMessageDisplay = document.getElementById('event-message');
    const numPlayersInput = document.getElementById('num-players');
    const startGameButton = document.getElementById('start-game-button');
    const playerSetupArea = document.getElementById('player-setup');
    const gameArea = document.getElementById('game-area');

    let numPlayers = 1;
    let currentPlayer = 1;
    let evented = 0;
    let playerPositions = [];
    let playerPieces = [];
    let playerNames = [];
    let playerSkipTurns = [];

    const squares = [
        { name: "スタート（星穹列車）", x: 14, y: 17, event: "最初に引いた限定星５キャラは？" },
        { name: "ゴミ箱", x: 8.5, y: 39, event: "チャレンジ！ヤリーロかピノコニーに行き「ゴミ箱」を見つけろ！（1分以内）" },
        { name: "BGM", x: 8.5, y: 62, event: "一番好きなBGMは？" },
        { name: "育てたいキャラ", x: 10, y: 84, event: "次に育てたいキャラは？" },
        { name: "HPチャレンジ", x: 23, y: 88, event: "チャレンジ！編成画面を開き、一番左にいるキャラの「HPの下一桁」を確認する。偶数なら成功！奇数なら失敗！" },
        { name: "きっかけ", x: 20, y: 64, event: "スタレを始めたきっかけは？" },
        { name: "好きなボス", x: 29, y: 53, event: "好きなボスは？" },
        { name: "好きなキャラ", x: 22, y: 38, event: "一番好きなキャラは？" },
        { name: "好きな星", x: 35, y: 22, event: "一番好きな星は？" },
        { name: "マップ・景色", x: 37, y: 40, event: "一番好きなマップ・景色は？" },
        { name: "ストーリー", x: 43, y: 55, event: "好きなストーリーは？" },
        { name: "必殺技", x: 35, y: 72, event: "好きな必殺技は？" },
        { name: "次に引きたい", x: 39, y: 92, event: "次に引きたいキャラは？" },
        { name: "運命", x: 54, y: 82, event: "どの運命を歩んでみたい？" },
        { name: "組織", x: 55, y: 64, event: "どの組織に入ってみたい？（例：星核ハンター）" },
        { name: "手料理", x: 52, y: 46, event: "手料理を食べてみたいキャラは？" },
        { name: "ショートカット！？", x: 50, y: 28, event: "ショートカット！？ Lv0遺物を+3強化！\n【会心率・会心ダメ・速度】のどれかが追加or強化で成功！", special: "shortcut" },
        { name: "光円錐", x: 65, y: 45, event: "好きな光円錐は？" },
        { name: "オシャレ", x: 69, y: 70, event: "オシャレだと思うキャラは？" },
        { name: "よく使う編成", x: 64, y: 92, event: "よく使う編成は？" },
        { name: "完凸", x: 75, y: 90, event: "完凸無料なら誰凸る？" },
        { name: "列車墜落", x: 88, y: 85, event: "列車が墜落！？ 1回やすみ", special: "skip_turn" },
        { name: "消耗品", x: 93, y: 65, event: "食べてみたい消耗品は？" },
        { name: "自慢の遺物", x: 77, y: 65, event: "自慢の遺物があれば見せて！" },
        { name: "好きな星神", x: 74, y: 42, event: "好きな星神は？" },
        { name: "神引き", x: 90, y: 45, event: "一番の神引きを教えて！" },
        { name: "すりぬけ", x: 65, y: 25, event: "一番すりぬけで会うキャラは？" },
        { name: "ゴール（創世の渦心）", x: 85, y: 20, event: "ゴール！\n「見事なゴールだったよ、君の勝利に祝福を。」", goal: true }
    ];

    startGameButton.addEventListener('click', () => {
        numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers > 4) numPlayers = 4;
        if (numPlayers < 1) numPlayers = 1;

        playerNames = [];
        for (let i = 1; i <= numPlayers; i++) {
            const nameInput = document.getElementById(`player-${i}-name`);
            playerNames.push(nameInput.value || `プレイヤー${i}`);
        }

        initializeGame();
        playerSetupArea.style.display = 'none';
        gameArea.style.display = 'block';
        rollDiceButton.disabled = false;
    });
    
    function initializeGame() {
        currentPlayer = 1;
        playerPositions = Array(numPlayers).fill(0);
        playerSkipTurns = Array(numPlayers).fill(0);
        playerPieces.forEach(piece => piece.remove());
        playerPieces = [];

        for (let i = 0; i < numPlayers; i++) {
            const piece = document.createElement('div');
            piece.classList.add('player-piece', `player-${i + 1}`);
            gameBoardContainer.appendChild(piece);
            playerPieces.push(piece);
            updatePlayerPiecePosition(i);
        }
        updateGameInfo();
        eventMessageDisplay.textContent = `ゲームスタート！\nまずは全員、「${squares[0].event}」`;
    }

    rollDiceButton.addEventListener('click', () => {
        if (playerSkipTurns[currentPlayer - 1] > 0) {
            playerSkipTurns[currentPlayer - 1]--;
            diceResultDisplay.textContent = "-";
            eventMessageDisplay.textContent = `${playerNames[currentPlayer - 1]} はお休み中です...💤`;
            currentPlayer = (currentPlayer % numPlayers) + 1;
            updateGameInfo();
            return;
        }

        const diceRoll = Math.floor(Math.random() * 6) + 1;
        diceResultDisplay.textContent = diceRoll;
        evented = 0;
        movePlayer(diceRoll);
    });

    function movePlayer(steps) {
        let currentPositionIndex = playerPositions[currentPlayer - 1];
        let newPositionIndex = currentPositionIndex + steps;

        if (newPositionIndex >= squares.length - 1) {
            newPositionIndex = squares.length - 1;
            playerPositions[currentPlayer - 1] = newPositionIndex;
            updatePlayerPiecePosition(currentPlayer - 1);
            updateGameInfo();
            eventMessageDisplay.textContent = `🎉 ${playerNames[currentPlayer - 1]} が到着！ 🎉\n${squares[newPositionIndex].event}`;
            rollDiceButton.disabled = true;
            alert(`${playerNames[currentPlayer - 1]}の勝利です！おめでとうございます！`);
            return;
        }

        playerPositions[currentPlayer - 1] = newPositionIndex;
        updatePlayerPiecePosition(currentPlayer - 1);
        updateGameInfo();
        handleSquareEvent(newPositionIndex);

        currentPlayer = (currentPlayer % numPlayers) + 1;
        updateGameInfo();
    }

    function handleSquareEvent(squareIndex) {
        const square = squares[squareIndex];
        eventMessageDisplay.textContent = `${playerNames[currentPlayer - 1]} が止まりました。\n💬「${square.event}」`;

        if (square.special === "shortcut") {
            evented = 1;
            setTimeout(() => {
                const success = confirm("【ショートカットチャンス！】\n遺物強化の結果、「会心率・会心ダメ・速度」のどれかが追加または強化されましたか？\n(OK = 成功 / キャンセル = 失敗)");
                if (success) {
                    eventMessageDisplay.textContent += ` \n✨ 大成功！赤い橋を渡ってワープします！ ✨`;
                    let newPositionIndex = 26;
                    let targetPlayer = currentPlayer === 1 ? numPlayers : currentPlayer - 1;
                    playerPositions[targetPlayer - 1] = newPositionIndex;
                    updatePlayerPiecePosition(targetPlayer - 1);
                    setTimeout(() => {
                         eventMessageDisplay.textContent = `${playerNames[targetPlayer - 1]} がワープしました！\n💬「${squares[newPositionIndex].event}」`;
                    }, 500);
                } else {
                    eventMessageDisplay.textContent += " \n💦 惜しくも失敗...通常ルートを進みます。";
                }
            }, 500);
        } else if (square.special === "skip_turn") {
            evented = 1;
            let targetPlayer = currentPlayer === 1 ? numPlayers : currentPlayer - 1;
            playerSkipTurns[targetPlayer - 1] = 1;
            eventMessageDisplay.textContent += " \n💥 残念！次のターンは1回お休みです。";
        }
    }

    function updatePlayerPiecePosition(playerIndex) {
        const squareIndex = playerPositions[playerIndex];
        const square = squares[squareIndex];
        const piece = playerPieces[playerIndex];

        if (square && piece) {
            const pieceWidth = 30;
            const pieceHeight = 30;

            piece.style.left = `calc(${square.x}% - ${pieceWidth / 2}px)`;
            piece.style.top = `calc(${square.y}% - ${pieceHeight / 2}px)`;

            let offsetMagnitude = window.innerWidth < 600 ? 3 : 5;
            let overlapCount = 0;
            let transformX = 0;
            let transformY = 0;

            for (let i = 0; i < numPlayers; i++) {
                if (i !== playerIndex && playerPositions[i] === squareIndex) {
                    overlapCount++;
                    switch((playerIndex + overlapCount) % 4) { 
                        case 0: transformX += offsetMagnitude; transformY += offsetMagnitude; break;
                        case 1: transformX -= offsetMagnitude; transformY += offsetMagnitude; break;
                        case 2: transformX += offsetMagnitude; transformY -= offsetMagnitude; break;
                        case 3: transformX -= offsetMagnitude; transformY -= offsetMagnitude; break;
                    }
                }
            }
            piece.style.transform = `translate(${transformX}px, ${transformY}px)`;
        }
    }

    function updateGameInfo() {
        currentPlayerDisplay.textContent = playerNames[currentPlayer - 1];
    }

    rollDiceButton.disabled = true;
});