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

    // すごろくのマス定義 (座標とイベント)
    // 画像に合わせて座標 (x, y%) と移動順を調整しました。
    const squares = [
        { name: "スタート（星穹列車）", x: 13.7, y: 16.9, event: "最初に引いた限定星５キャラは？" }, // 0
        { name: "一番好きな星は？", x: 34.1, y: 13.9, event: "一番好きな星は？" }, // 1
        { name: "一番好きなマップ・景色は？", x: 37.1, y: 28.5, event: "一番好きなマップ・景色は？" }, // 2
        { name: "一番好きなキャラは？", x: 23.5, y: 34.0, event: "一番好きなキャラは？" }, // 3
        { name: "チャレンジ！ヤリーロかピノコニーに行き「ゴミ箱」を見つけろ！（1分以内）", x: 9.8, y: 39.1, event: "チャレンジ！ヤリーロかピノコニーに行き「ゴミ箱」を見つけろ！（1分以内）" }, // 4
        { name: "一番好きなBGMは？", x: 9.0, y: 55.3, event: "一番好きなBGMは？" }, // 5
        { name: "次に育てたいキャラは？", x: 10.1, y: 72.8, event: "次に育てたいキャラは？" }, // 6
        { name: "チャレンジ！編成画面を開き、一番左にいるキャラの「HPの下一桁」を確認する。偶数なら成功！奇数なら失敗！", x: 23.6, y: 83.1, event: "チャレンジ！編成画面を開き、一番左にいるキャラの「HPの下一桁」を確認する。偶数なら成功！奇数なら失敗！" }, // 7
        { name: "スタレを始めたきっかけは？", x: 20.3, y: 62.5, event: "スタレを始めたきっかけは？" }, // 8
        { name: "好きなボスは？", x: 28.1, y: 53.6, event: "好きなボスは？" }, // 9
        { name: "好きな必殺技は？", x: 36.4, y: 69.4, event: "好きな必殺技は？" }, // 10
        { name: "次に引きたいキャラは？", x: 40.5, y: 84.7, event: "次に引きたいキャラは？" }, // 11
        { name: "よく使う編成は？", x: 62.1, y: 89.0, event: "よく使う編成は？" }, // 12
        { name: "どの運命を歩んでみたい？", x: 52.8, y: 80.9, event: "どの運命を歩んでみたい？" }, // 13
        { name: "好きなストーリーは？", x: 42.6, y: 53.0, event: "好きなストーリーは？" }, // 14
        { name: "ショートカット！？ Lv0遺物を+3強化！\n【会心率・会心ダメ・速度】のどれかが追加or強化で成功！", x: 51.5, y: 31.9, event: "ショートカット！？ Lv0遺物を+3強化！\n【会心率・会心ダメ・速度】のどれかが追加or強化で成功！", special: "shortcut" }, // 15
        { name: "手料理を食べてみたいキャラは？", x: 57.0, y: 56.6, event: "手料理を食べてみたいキャラは？" }, // 16
        { name: "どの組織に入ってみたい？（例：星核ハンター）", x: 64.9, y: 73.1, event: "どの組織に入ってみたい？（例：星核ハンター）" }, // 17
        { name: "完凸無料なら誰凸る？", x: 74.8, y: 86.8, event: "完凸無料なら誰凸る？" }, // 18
        { name: "オシャレだと思うキャラは？", x: 73.1, y: 57.9, event: "オシャレだと思うキャラは？" }, // 19
        { name: "好きな光円錐は？", x: 67.2, y: 44.5, event: "好きな光円錐は？" }, // 20
        { name: "一番すりぬけで会うキャラは？", x: 66.8, y: 20.8, event: "一番すりぬけで会うキャラは？" }, // 21
        { name: "好きな星神は？", x: 77.0, y: 39.8, event: "好きな星神は？" }, // 22
        { name: "自慢の遺物があれば見せて！", x: 80.7, y: 62.6, event: "自慢の遺物があれば見せて！" }, // 23
        { name: "列車が墜落！？ 1回やすみ", x: 86.5, y: 81.3, event: "列車が墜落！？ 1回やすみ", special: "skip_turn" }, // 24
        { name: "食べてみたい消耗品は？", x: 92.4, y: 65.5, event: "食べてみたい消耗品は？" }, // 25
        { name: "一番の神引きを教えて！", x: 89.9, y: 53.6, event: "一番の神引きを教えて！" }, // 26
        { name: "ゴール（創世の渦心）", x: 86.4, y: 13.9, event: "ゴール！\n「見事なゴールだったよ、君の勝利に祝福を。」", goal: true } // 27
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
