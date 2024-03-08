// VexFlowのグローバル変数VFを定義
const VF = Vex.Flow;

// URLからレベルパラメータを取得する関数
function getLevelFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('level') || 'basic'; // デフォルトは'basic'
}

// VexFlowのセットアップと初期化
function setupVexFlow() {
  const div = document.getElementById("flashcard");
  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  renderer.resize(100, 200); // サイズを調整
  const context = renderer.getContext();
  const stave = new VF.Stave(10, 40, 400);
  stave.addClef("treble").setContext(context).draw();
  return { context, stave };
}

// 楽譜のクリアと再描画
function redrawStave({ context, stave }) {
  context.clear();
  stave.setContext(context).draw();
}

// レベルに応じた音符のリストを返す関数
function getNotesListForLevel(level) {
  switch (level) {
    case '1-1':
      return ["c/4", "d/4", "e/4"];
    case '1-2':
      return ["c/4", "d/4", "e/4", "f/4", "g/4"];
    case '1-3':
      return ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4"];
    default:
      return ["c/4", "d/4", "e/4"]; // デフォルトは基本レベル
  }
}


let notesList; // 音符のリストをグローバル変数で定義
let lastNote = null; // 前回選択された音符を保持する変数
// ランダムに音符を選択（前回と異なる音符を選択）
function getRandomNote() {
  let index;
  let note;
  do {
    index = Math.floor(Math.random() * notesList.length);
    note = notesList[index];
  } while (note === lastNote); // 前回選択された音符と異なるまでループ
  lastNote = note; // 選択された音符を記憶
  return note;
}

// 音符を表示
function displayNote({ context, stave }) {
  const note = getRandomNote();
  currentNote = note;
  redrawStave({ context, stave });

  const newNote = new VF.StaveNote({ keys: [note], duration: "q" });
  const voice = new VF.Voice({ num_beats: 1, beat_value: 4 }).addTickables([newNote]);
  new VF.Formatter().joinVoices([voice]).format([voice], 400);
  voice.draw(context, stave);
}

  // ボタンクリックイベントの処理
function setupButtonClickEvent({ context, stave }) {
  document.querySelectorAll('.note-button').forEach(button => {
      button.addEventListener('click', function() {
        const note = this.getAttribute('data-note') + "/4";
        if (note === currentNote) {
          console.log("正解です！");
          correctCount++; // 正解数をインクリメント
          // 正解のフィードバックを表示
          const feedback = document.getElementById('feedback');
          const correct = document.getElementById('correct');
          feedback.style.display = 'block';
          correct.style.display = 'block';
          // 0.2秒後にフィードバックを非表示
          setTimeout(() => {
            feedback.style.display = 'none';
            correct.style.display = 'none';
          }, 300); // 0.3秒 = 300ミリ秒
          displayNote({ context, stave }); // 新しい音符を表示
          // 音声を再生する処理を追加
          const audioId = `audio-${note.charAt(0)}`; // 'c/4'から'c'のみを取得してIDを生成
          const audio = document.getElementById(audioId);
          audio.playbackRate = 2.5; // 再生速度を2.5倍に設定
          audio.play();
        } else {
          console.log("不正解です。");
          // 不正解のフィードバック表示ロジック（必要に応じて実装）
          const flashcard = document.getElementById('flashcard'); 
          flashcard.classList.add('shake');
          // アニメーションが終了したらクラスを削除
          flashcard.addEventListener('animationend', () => {
            flashcard.classList.remove('shake');
          }, { once: true });
        }
      });
    });
  }

// アプリケーションの初期化
function initializeApp() {
  const level = getLevelFromURL();
  notesList = getNotesListForLevel(level); // notesListをグローバル変数として定義しておく
  const { context, stave } = setupVexFlow();
  displayNote({ context, stave });
  setupButtonClickEvent({ context, stave });
  // カウントダウンの開始
  let timeLeft = 20; // 制限時間（秒）
  const countdownElement = document.getElementById('countdown');
  const countdownTimer = setInterval(() => {
    timeLeft--;
    countdownElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      window.location.href = `result.html?score=${correctCount}`; // 結果表示ページにリダイレクト
    }
  }, 1000);
}

let currentNote = "c/4"; // 現在表示されている音符を保持する変数
let correctCount = 0; // 正解数をカウントする変数
initializeApp();