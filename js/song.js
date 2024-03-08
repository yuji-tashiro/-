const VF = Vex.Flow;

// メリーさんの羊の最初の部分
let maryHadALittleLambNotes = [
  // 1小節目
  [{ keys: ["e/4"], duration: "q" },
   { keys: ["d/4"], duration: "q" },
   { keys: ["c/4"], duration: "q" },
   { keys: ["d/4"], duration: "q" }],
  // 2小節目
  [{ keys: ["e/4"], duration: "q" },
   { keys: ["e/4"], duration: "q" },
   { keys: ["e/4"], duration: "h" }],
  // 3小節目
  [{ keys: ["d/4"], duration: "q" },
   { keys: ["d/4"], duration: "q" },
   { keys: ["d/4"], duration: "h" }],
  // 4小節目
  [{ keys: ["e/4"], duration: "q" },
   { keys: ["g/4"], duration: "q" },
   { keys: ["g/4"], duration: "h" }]
];

let currentMeasureIndex = 0; // 現在の小節のインデックス
let currentNoteIndex = 0; // 現在の音符のインデックス

function setupVexFlow() {
  const div = document.getElementById("musicSheet");
  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  renderer.resize(800, 200); // サイズを調整
  const context = renderer.getContext();
  let startX = 10; // 最初の小節の開始位置
  const staveWidth = 200; // 各小節の幅

  displayCurrentMeasure(context, startX, staveWidth);
}

function displayCurrentMeasure(context, startX, staveWidth) {
  // 現在の小節を取得して表示する処理
  const currentMeasure = maryHadALittleLambNotes[currentMeasureIndex];
  const stave = new VF.Stave(startX, 40, staveWidth);
  if (currentMeasureIndex === 0) {
    stave.addClef("treble");
  }
  stave.setContext(context).draw();

  // 音符の描画
  const staveNotes = currentMeasure.map((note, index) => {
    const staveNote = new VF.StaveNote({
      keys: note.keys,
      duration: note.duration
    });

    // 現在の音符に特別なスタイルを適用
    if (index === currentNoteIndex) {
      // 色をより鮮やかなものに変更し、太さを増やす
      staveNote.setStyle({ fillStyle: "red", strokeStyle: "red", lineWidth: 3 });
    }

    return staveNote;
  });

  const voice = new VF.Voice({ num_beats: 4, beat_value: 4 }).addTickables(staveNotes);
  new VF.Formatter().joinVoices([voice]).format([voice], staveWidth - 50);
  voice.draw(context, stave);
}

function checkNoteAndAdvance(note) {
  const currentMeasure = maryHadALittleLambNotes[currentMeasureIndex];
  const currentNote = currentMeasure[currentNoteIndex];
  if (note === currentNote.keys[0]) {
    currentNoteIndex++;
    if (currentNoteIndex >= currentMeasure.length) {
      currentNoteIndex = 0;
      currentMeasureIndex++;
      if (currentMeasureIndex < maryHadALittleLambNotes.length) {
        displayCurrentMeasure(); // 次の小節を表示
      }
    }
  } else {
    // 不正解の場合、特に何もしない（ユーザーが正しいボタンを押すまで待つ）
  }
}

// ボタンクリックイベントの設定
document.querySelectorAll('.note-button').forEach(button => {
  button.addEventListener('click', function() {
    const note = this.getAttribute('data-note') + "/4";
    checkNoteAndAdvance(note);
  });
});

setupVexFlow(); // 初期の小節を表示
