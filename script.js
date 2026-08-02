// 教員アカウント一覧（初回起動時は空。メールアドレス＋「1234」で初回登録）
let teachers = [];

// クラス一覧
let classes = [
  { id: '1A', name: '1年A組', isClassMode: false },
  { id: '1B', name: '1年B組', isClassMode: false }
];

let selectedClassId = '1A'; // 教員画面で現在選択中のクラス

// 向き管理 (front -> side -> back)
let currentDirIndex = 0;
const directions = ['front', 'side', 'back'];

// レベルシステム: 各レベルに必要な「累計総EXP」
const LEVEL_THRESHOLDS = [0, 30, 70, 120, 180, 250, 330, 420, 520, 630, 750];
// Lv1=0, Lv2=30, Lv3=70, Lv4=120, Lv5=180, Lv6=250, Lv7=330, Lv8=420, Lv9=520, Lv10=630, Lv11=750

function calcLevel(totalExp) {
  let lv = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalExp >= LEVEL_THRESHOLDS[i]) lv = i + 1;
    else break;
  }
  return lv;
}

function expToNextLevel(totalExp) {
  const lv = calcLevel(totalExp);
  if (lv >= LEVEL_THRESHOLDS.length) return null; // 最大レベル
  return LEVEL_THRESHOLDS[lv] - totalExp;
}

function expProgressInLevel(totalExp) {
  const lv = calcLevel(totalExp);
  const base = LEVEL_THRESHOLDS[lv - 1];
  const next = LEVEL_THRESHOLDS[lv] ?? LEVEL_THRESHOLDS[lv - 1];
  const range = next - base;
  if (range === 0) return 100;
  return Math.floor(((totalExp - base) / range) * 100);
}

// 単元マスターデータ
let stages = [
  {
    id: 'stage_1',
    classId: 'all',
    title: '少年の日の思い出',
    skill: '情景の想像',
    summary: 'この単元では「少年の日の思い出」を通じて、幼少期の失敗と後悔、自己認識について学びました。主人公の心情の変化と情景描写の工夫に注目しましょう。',
    narratorImage: null,
    missions: [
      '① 本文の音読を完了する',
      '② エーミールの性格をまとめる',
      '③ クジャクヤママユの場面の考察'
    ],
    dialogues: [
      { speaker: '私', text: '「そうか、君も蝶の標本を見たいのだね。私の書斎へようこそ…」' },
      { speaker: '客', text: '「ええ、あなたの集めた見事なコレクションを見せてください。」' },
      { speaker: '私', text: '「では見せよう。…だが、これを見るたびに私は、少年の頃のある苦い思い出を思い出すのだよ。」' }
    ]
  },
  {
    id: 'stage_2',
    classId: 'all',
    title: '走れメロス',
    skill: '信念の走走',
    summary: 'この単元では「走れメロス」を通じて、友情・信頼・信念の大切さを学びました。メロスの行動を通じて、約束を果たすことの意味について考えましょう。',
    narratorImage: null,
    missions: [
      '① メロスと王の対話の読み取り',
      '② セリヌンティウスとの絆の考察',
      '③ 走る場面の表現工夫のまとめ'
    ],
    dialogues: [
      { speaker: 'メロス', text: '「黒い風のように走れ！ 私の命など問題ではない。私は信頼に報いねばならぬ。」' },
      { speaker: '語り', text: '陽は西に傾き、メロスの足は限界に近づいていた…' }
    ]
  }
];

// クラスごとの単元ミッション解放状態データ構造
// classMissionSettings[classId][stageId] = [true, false, false]
let classMissionSettings = {
  '1A': {
    'stage_1': [true, true, false],
    'stage_2': [false, false, false]
  },
  '1B': {
    'stage_1': [true, false, false],
    'stage_2': [false, false, false]
  }
};

// ガチャアイテム一覧（種類別プール: '5' / '10' / '15'）
const gachaPools = {
  '5':  [
    { id: 'g1', name: '木の剣',    weight: 60, classId: 'all', gender: 'all', images: { front: 'sword_front.png', side: 'sword_side.png', back: 'sword_back.png' } },
    { id: 'g2', name: '見習いの服', weight: 30, classId: 'all', gender: 'all', images: { front: '', side: '', back: '' } }
  ],
  '10': [
    { id: 'g3', name: '丸めがね',   weight: 60, classId: 'all', gender: 'all', images: { front: '', side: '', back: '' } },
    { id: 'g4', name: '国語の辞書', weight: 30, classId: 'all', gender: 'all', images: { front: '', side: '', back: '' } }
  ],
  '15': [
    { id: 'g5', name: '伝説の羽ペン', weight: 60, classId: 'all', gender: 'all', images: { front: '', side: '', back: '' } },
    { id: 'g6', name: '黄金の万年筆', weight: 30, classId: 'all', gender: 'all', images: { front: '', side: '', back: '' } }
  ]
};

// 掲示板データ
let announcements = [];

// 生徒データ
let students = [
  {
    id: 'student01',
    name: '山田 太郎',
    classId: '1A',
    pass: '1234',
    avatar: 'boy.png',
    exp: 30,
    totalExp: 50,
    todayExp: 0,
    checkedInToday: false,
    skills: [],
    items: ['木の剣'],
    equipped: '木の剣',
    progress: { stage_1: 1, stage_2: 0 }
  },
  {
    id: 'student02',
    name: '佐藤 花子',
    classId: '1A',
    pass: '1234',
    avatar: 'girl.png',
    exp: 25,
    totalExp: 80,
    todayExp: 10,
    checkedInToday: false,
    skills: ['情景の想像'],
    items: [],
    equipped: 'なし',
    progress: { stage_1: 2, stage_2: 0 }
  },
  {
    id: 'student03',
    name: '鈴木 一郎',
    classId: '1B',
    pass: '1234',
    avatar: 'boy.png',
    exp: 10,
    totalExp: 20,
    todayExp: 0,
    checkedInToday: false,
    skills: [],
    items: [],
    equipped: 'なし',
    progress: { stage_1: 0, stage_2: 0 }
  }
];

let currentUser = null;
let currentStage = null;
let currentDialogueIndex = 0;
let modalConfigStageId = null;

// 画像アップロード一時保存
let narratorImgDataUrl = null; // null=未変更, ''=削除, 'data:...'=新画像
let gachaImgDataUrls = { front: '', side: '', back: '' };

// 初期化
window.onload = function() {
  initClassSelect();
};

function initClassSelect() {
  const select = document.getElementById('teacher-class-select');
  select.innerHTML = '';
  classes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.innerText = c.name;
    select.appendChild(opt);
  });
  select.value = selectedClassId;
  populateClassFormSelects();
  updateClassDisplays();
}

function updateClassDisplays() {
  const c = classes.find(cl => cl.id === selectedClassId);
  const name = c ? c.name : '';
  ['current-class-display-1', 'current-class-display-2', 'current-class-display-3', 'current-class-display-4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = name;
  });

  if (c) {
    document.getElementById('mode-text').innerText = c.isClassMode ? '授業中 (ON)' : '授業外 (OFF)';
    document.getElementById('mode-text').className = c.isClassMode ? 'text-on' : 'text-off';
    document.getElementById('mode-btn').innerText = c.isClassMode ? '授業を終了する (OFFにする)' : '授業を開始する (ONにする)';
  }
}

function onSelectClassChanged() {
  selectedClassId = document.getElementById('teacher-class-select').value;
  updateClassDisplays();
  renderTeacherDashboard();
  // 管理タブが開いていれば更新
  const manageTab = document.getElementById('teacher-tab-manage');
  if (manageTab && !manageTab.classList.contains('hidden')) renderClassManageTab();
}

// ログイン
function login() {
  const userId   = document.getElementById('user-id').value.trim();
  const userPass = document.getElementById('user-pass').value;

  // ① 既存の教員アカウントでログイン
  const teacher = teachers.find(t => t.id === userId && t.pass === userPass);
  if (teacher) {
    currentUser = teacher;
    showScreen('teacher-screen');
    renderTeacherDashboard();
    return;
  }

  // ② 新規教員アカウント作成: メールアドレス形式 ＋ 初期パスワード「1234」
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId);
  if (emailOk && userPass === '1234') {
    const alreadyExists = teachers.find(t => t.id === userId);
    if (alreadyExists) {
      // アカウントはあるがパスワード違い
      alert('IDまたはパスワードが違います');
      return;
    }
    const newTeacher = { id: userId, pass: '1234', role: 'teacher' };
    teachers.push(newTeacher);
    currentUser = newTeacher;
    showScreen('teacher-screen');
    renderTeacherDashboard();
    alert(`✅ 教員アカウントを作成しました。\nID: ${userId}\n\n⚠️ ログイン後、「設定」タブからパスワードを変更してください。`);
    return;
  }

  // ③ 生徒ログイン
  const student = students.find(s => s.id === userId && s.pass === userPass);
  if (student) {
    currentUser = student;
    if (!student.avatar) {
      document.getElementById('avatar-select-modal').classList.remove('hidden');
      return;
    }
    startStudentSession();
    return;
  }

  alert('IDまたはパスワードが違います');
}

function selectAvatar(avatarPath) {
  currentUser.avatar = avatarPath;
  document.getElementById('avatar-select-modal').classList.add('hidden');
  startStudentSession();
}

function startStudentSession() {
  let gotBonus = false;
  const studentClass = classes.find(c => c.id === currentUser.classId);
  if (studentClass && studentClass.isClassMode && !currentUser.checkedInToday) {
    currentUser.exp += 1;
    currentUser.totalExp += 1;
    currentUser.todayExp += 1;
    currentUser.checkedInToday = true;
    gotBonus = true;
  }
  showScreen('student-screen');
  renderStudentDashboard(gotBonus);
  showStudentTab('map');
}

function logout() {
  currentUser = null;
  document.getElementById('user-id').value = '';
  document.getElementById('user-pass').value = '';
  showScreen('login-screen');
}

function showScreen(screenId) {
  ['login-screen', 'teacher-screen', 'student-screen', 'adventure-screen'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
}

// 生徒タブ切替
window.showStudentTab = function(tab) {
  ['map', 'items', 'bulletin', 'skills', 'settings'].forEach(s => {
    const el = document.getElementById('section-' + s);
    if (el) el.style.display = (s === tab) ? '' : 'none';
  });
  document.querySelectorAll('.st-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
};

// 教員タブ切替
function switchTeacherTab(tabName) {
  ['students', 'missions', 'gacha', 'bulletin', 'manage', 'settings'].forEach(t => {
    document.getElementById(`teacher-tab-${t}`).classList.add('hidden');
    document.getElementById(`tab-btn-${t}`).classList.remove('active');
  });
  document.getElementById(`teacher-tab-${tabName}`).classList.remove('hidden');
  document.getElementById(`tab-btn-${tabName}`).classList.add('active');
  if (tabName === 'manage') renderClassManageTab();
  if (tabName === 'settings') renderTeacherSettings();
}

function renderTeacherSettings() {
  const el = document.getElementById('teacher-settings-id');
  if (el && currentUser) el.innerText = currentUser.id;
}

window.teacherChangePassword = function() {
  const current = document.getElementById('t-pw-current').value;
  const newPw   = document.getElementById('t-pw-new').value;
  const confirm = document.getElementById('t-pw-confirm').value;
  const msg     = document.getElementById('t-pw-msg');

  if (current !== currentUser.pass) {
    msg.style.color = '#e53e3e';
    msg.innerText = '❌ 現在のパスワードが違います';
    return;
  }
  if (newPw.length < 4) {
    msg.style.color = '#e53e3e';
    msg.innerText = '❌ パスワードは4文字以上で設定してください';
    return;
  }
  if (newPw !== confirm) {
    msg.style.color = '#e53e3e';
    msg.innerText = '❌ 新しいパスワードが一致しません';
    return;
  }
  currentUser.pass = newPw;
  ['t-pw-current','t-pw-new','t-pw-confirm'].forEach(id => document.getElementById(id).value = '');
  msg.style.color = '#48bb78';
  msg.innerText = '✅ パスワードを変更しました！';
};

// タップで向き切り替え (front -> side -> back)
function rotateAvatar() {
  currentDirIndex = (currentDirIndex + 1) % directions.length;
  if (currentUser) {
    renderStudentDashboard(false);
  }
}

// アバターと装備品画像の重ね合わせHTMLの作成
function renderAvatarWithEquipment(avatarBaseName, equippedItemName) {
  if (!avatarBaseName) {
    return `<div style="color:#aaa; font-size:0.8em;">未設定</div>`;
  }

  const dir = directions[currentDirIndex];
  const baseName = avatarBaseName.replace(/\.[^/.]+$/, "");
  const ext = avatarBaseName.split('.').pop();
  const avatarSrc = `${baseName}_${dir}.${ext}`;

  let equipImgHTML = '';
  if (equippedItemName && equippedItemName !== 'なし') {
    const allPoolItems = [...gachaPools['5'], ...gachaPools['10'], ...gachaPools['15']];
    const item = allPoolItems.find(i => i.name === equippedItemName);
    
    if (item && item.images && item.images[dir]) {
      equipImgHTML = `<img src="${item.images[dir]}" class="sprite-img" style="z-index:2;" onerror="this.style.display='none'">`;
    }
  }

  return `
    <img src="${avatarSrc}" class="sprite-img" style="z-index:1;" onerror="this.src='${avatarBaseName}'">
    ${equipImgHTML}
  `;
}

// 教員画面描画
function renderTeacherDashboard() {
  if (!document.getElementById('student-grid')) return;
  populateClassFormSelects();
  renderStudentGrid();
  renderClassStageList();
  renderGachaManageList();
  renderBulletinManageList();
  populateBulkStageSelect();
}

// 【タブ1】生徒一覧＆個別の達成状態操作
function renderStudentGrid() {
  const grid = document.getElementById('student-grid');
  grid.innerHTML = '';

  const classStudents = students.filter(s => s.classId === selectedClassId);

  if (classStudents.length === 0) {
    grid.innerHTML = '<p class="hint">このクラスに所属する生徒はいません。</p>';
    return;
  }

  classStudents.forEach(st => {
    const card = document.createElement('div');
    card.className = `student-card ${st.todayExp === 0 ? 'low-pt' : ''}`;

    const avatarHTML = renderAvatarWithEquipment(st.avatar, st.equipped);

    let missionControlsHTML = '';
    stages.forEach(stg => {
      if (!st.progress) st.progress = {};

      const prog = st.progress[stg.id] || 0;
      const total = stg.missions.length;

      missionControlsHTML += `
        <div class="student-mission-box">
          <b>${stg.title}</b><br>
          達成数: <b>${prog}/${total}</b>
          <div style="margin-top:5px; display:flex; gap:4px; flex-wrap:wrap;">
            <button onclick="changeStudentProgress('${st.id}', '${stg.id}', 1)" ${prog >= total ? 'disabled' : ''} style="font-size:0.75em; padding:3px 6px; background:#38a169;">✅ 1つ達成</button>
            <button onclick="changeStudentProgress('${st.id}', '${stg.id}', -1)" ${prog <= 0 ? 'disabled' : ''} class="btn-secondary" style="font-size:0.7em; padding:3px 6px;">-1</button>
          </div>
        </div>
      `;
    });

    const stLv = calcLevel(st.totalExp);
    const stNext = expToNextLevel(st.totalExp);
    const stPct = expProgressInLevel(st.totalExp);

    card.innerHTML = `
      <div class="sprite-box">${avatarHTML}</div>
      <h4>${st.name}</h4>
      <p style="font-size:0.78em; color:#a0aec0; margin:0 0 4px;">ID: ${st.id}
        &nbsp;|&nbsp; 🔑 PW:
        <span id="pw-disp-${st.id}" style="display:none;" class="pw-badge">${st.pass}</span>
        <span id="pw-mask-${st.id}">••••</span>
        <button class="pw-toggle-btn" id="pw-toggle-${st.id}" onclick="togglePwDisplay('${st.id}')">表示</button>
      </p>
      <div class="level-badge">Lv.${stLv}</div>
      <div class="exp-bar-wrap" title="次のレベルまで ${stNext ?? '—'} EXP">
        <div class="exp-bar-fill" style="width:${stPct}%"></div>
      </div>
      <p style="font-size:0.8em; color:#a0aec0; margin:2px 0 6px;">総EXP: ${st.totalExp} / 本日: +${st.todayExp}</p>
      <p><small>🎰 ガチャ用EXP: <b>${st.exp}</b></small></p>

      <div class="pt-buttons">
        <button onclick="addExp('${st.id}', 1)">+1 EXP</button>
        <button onclick="addExp('${st.id}', 5)">+5 EXP</button>
        <button onclick="addExp('${st.id}', 10)">+10 EXP</button>
      </div>
      <div class="custom-pt-box">
        <input type="number" id="custom-exp-${st.id}" placeholder="EXP">
        <button onclick="addCustomExp('${st.id}')">加算</button>
      </div>

      <hr style="border:0; border-top:1px solid #5a5a7a; margin:10px 0;">
      <h5>🎯 単元ミッション達成コントロール</h5>
      ${missionControlsHTML}
    `;
    grid.appendChild(card);
  });
}

function changeStudentProgress(studentId, stageId, delta) {
  const st = students.find(s => s.id === studentId);
  const stg = stages.find(s => s.id === stageId);
  if (!st || !stg) return;

  if (!st.progress[stageId]) st.progress[stageId] = 0;
  st.progress[stageId] += delta;

  if (st.progress[stageId] < 0) st.progress[stageId] = 0;
  if (st.progress[stageId] > stg.missions.length) st.progress[stageId] = stg.missions.length;

  if (st.progress[stageId] === stg.missions.length && !st.skills.includes(stg.skill)) {
    st.skills.push(stg.skill);
  }

  renderStudentGrid();
}

function addExp(studentId, amount) {
  const st = students.find(s => s.id === studentId);
  if (st) {
    const prevLevel = calcLevel(st.totalExp);
    st.exp += amount;
    st.totalExp += amount;
    st.todayExp += amount;
    const newLevel = calcLevel(st.totalExp);
    if (newLevel > prevLevel) {
      setTimeout(() => alert(`🎉 ${st.name} が Lv.${newLevel} にレベルアップ！`), 50);
    }
    renderStudentGrid();
  }
}

function addCustomExp(studentId) {
  const input = document.getElementById(`custom-exp-${studentId}`);
  const val = parseInt(input.value);
  if (!isNaN(val) && val > 0) {
    addExp(studentId, val);
    input.value = '';
  }
}

// 【タブ2】クラスごとの単元ミッション解放一覧の描画
function renderClassStageList() {
  const list = document.getElementById('class-stage-list');
  list.innerHTML = '';

  if (stages.length === 0) {
    list.innerHTML = '<p class="hint">登録されている単元はありません。</p>';
    return;
  }

  if (!classMissionSettings[selectedClassId]) {
    classMissionSettings[selectedClassId] = {};
  }

  // このクラスに適用される単元のみ表示（全クラス共通 or このクラス専用）
  const visibleStages = stages.filter(s => s.classId === 'all' || s.classId === selectedClassId);

  if (visibleStages.length === 0) {
    list.innerHTML = '<p class="hint">このクラスに適用されている単元はありません。</p>';
    return;
  }

  visibleStages.forEach(stg => {
    // 未設定の場合は初期化
    if (!classMissionSettings[selectedClassId][stg.id]) {
      classMissionSettings[selectedClassId][stg.id] = new Array(stg.missions.length).fill(false);
    }

    const settings = classMissionSettings[selectedClassId][stg.id];
    const unlockedCount = settings.filter(Boolean).length;
    const scopeBadge = stg.classId === 'all'
      ? `<span style="font-size:0.72em; background:#4a5568; color:#e2e8f0; border-radius:4px; padding:1px 6px; margin-left:6px;">🌐 全クラス共通</span>`
      : `<span style="font-size:0.72em; background:#553c1a; color:#ecc94b; border-radius:4px; padding:1px 6px; margin-left:6px;">📌 このクラス専用</span>`;

    const div = document.createElement('div');
    div.className = 'teacher-stage-item';
    div.innerHTML = `
      <div>
        <strong>📖 ${stg.title}</strong>${scopeBadge} (スキル: ${stg.skill})
        <br><small style="color:#ecc94b;">現在の解放状況: 全${stg.missions.length}個中 <b>${unlockedCount}個解放中</b> (他は『???』表示)</small>
      </div>
      <div>
        <button onclick="openMissionModal('${stg.id}')" class="btn-primary">🔓 ミッション解放設定</button>
        <button onclick="editStage('${stg.id}')" class="btn-secondary" style="margin-left:5px;">編集</button>
        <button onclick="deleteStage('${stg.id}')" class="btn-danger" style="margin-left:5px;">削除</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// ミッション解放設定モーダルの操作
function openMissionModal(stageId) {
  modalConfigStageId = stageId;
  const stg = stages.find(s => s.id === stageId);
  const cls = classes.find(c => c.id === selectedClassId);

  document.getElementById('modal-stage-title').innerText = `📖 ${stg.title} - ミッション解放設定`;
  document.getElementById('modal-class-name').innerText = cls ? cls.name : '';

  renderModalMissionList();
  document.getElementById('mission-config-modal').classList.remove('hidden');
}

function renderModalMissionList() {
  const container = document.getElementById('modal-mission-list');
  container.innerHTML = '';

  const stg = stages.find(s => s.id === modalConfigStageId);
  const settings = classMissionSettings[selectedClassId][modalConfigStageId];

  stg.missions.forEach((mText, idx) => {
    const isUnlocked = settings[idx] || false;
    const div = document.createElement('div');
    div.className = `mission-toggle-item ${isUnlocked ? 'unlocked' : 'locked'}`;
    div.innerHTML = `
      <div>
        <b>ミッション ${idx + 1}:</b> ${mText}
        <br><small style="color:${isUnlocked ? '#48bb78' : '#e53e3e'};">${isUnlocked ? '🔓 生徒画面に解放中' : '🔒 生徒画面では「???」と表示'}</small>
      </div>
      <button onclick="toggleSingleMission(${idx})" class="${isUnlocked ? 'btn-danger' : 'btn-success'}" style="font-size:0.8em;">
        ${isUnlocked ? '「???」にする' : '解放する'}
      </button>
    `;
    container.appendChild(div);
  });
}

function toggleSingleMission(index) {
  const settings = classMissionSettings[selectedClassId][modalConfigStageId];
  settings[index] = !settings[index];
  renderModalMissionList();
  renderClassStageList();
}

function toggleAllMissions(status) {
  const stg = stages.find(s => s.id === modalConfigStageId);
  classMissionSettings[selectedClassId][modalConfigStageId] = new Array(stg.missions.length).fill(status);
  renderModalMissionList();
  renderClassStageList();
}

function closeMissionModal() {
  document.getElementById('mission-config-modal').classList.add('hidden');
  modalConfigStageId = null;
}

// 単元追加・編集
function parseDialogueLines(text) {
  return text.split('\n').map(line => {
    const parts = line.split(/[:：]/);
    if (parts.length >= 2) {
      return { speaker: parts[0].trim(), text: parts.slice(1).join(':').trim() };
    } else {
      return { speaker: '語り', text: line.trim() };
    }
  });
}

// ============================================================
// 画像アップロードヘルパー（window に明示登録してインライン onchange から確実に呼べるようにする）
// ============================================================
window.previewNarratorImage = function(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    narratorImgDataUrl = e.target.result;
    const preview = document.getElementById('stage-narrator-preview');
    const img = document.getElementById('stage-narrator-img-preview');
    img.src = narratorImgDataUrl;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(input.files[0]);
};

window.clearNarratorImage = function() {
  narratorImgDataUrl = null;
  document.getElementById('stage-narrator-img').value = '';
  document.getElementById('stage-narrator-preview').style.display = 'none';
};

window.previewGachaImg = function(input, previewId, dir) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    gachaImgDataUrls[dir] = e.target.result;
    const img = document.getElementById(previewId);
    img.src = e.target.result;
    img.style.display = 'block';
  };
  reader.readAsDataURL(input.files[0]);
};

function saveStage() {
  const editId = document.getElementById('editing-stage-id').value;
  const title = document.getElementById('stage-title').value.trim();
  const missionsText = document.getElementById('stage-missions').value.trim();
  const summary = document.getElementById('stage-summary')?.value.trim() || '';
  const dialogueText = document.getElementById('stage-dialogue').value.trim();
  const skill = document.getElementById('stage-skill').value.trim();

  if (!title || !dialogueText || !skill) {
    alert('タイトル・会話・スキルを入力してください');
    return;
  }

  const missions = missionsText ? missionsText.split('\n').map(m => m.trim()).filter(m => m.length > 0) : ['① 学習を完了する'];
  const parsedDialogues = parseDialogueLines(dialogueText);

  // 語り手画像: null=変更なし(既存保持), ''=削除, 'data:...'=新画像
  const getNewNarratorImage = (existingImage) => {
    if (narratorImgDataUrl === null) return existingImage; // 変更なし
    return narratorImgDataUrl || null; // 新画像 or 削除
  };

  const stageClassTarget = document.getElementById('stage-class-select')?.value || 'all';

  if (editId) {
    const stg = stages.find(s => s.id === editId);
    if (stg) {
      stg.title = title;
      stg.missions = missions;
      stg.summary = summary;
      stg.dialogues = parsedDialogues;
      stg.skill = skill;
      stg.classId = stageClassTarget;
      stg.narratorImage = getNewNarratorImage(stg.narratorImage);
      // classIdが'all'になった場合、未初期化のクラスを補完
      if (stageClassTarget === 'all') {
        classes.forEach(c => {
          if (!classMissionSettings[c.id]) classMissionSettings[c.id] = {};
          if (!classMissionSettings[c.id][editId]) {
            classMissionSettings[c.id][editId] = new Array(missions.length).fill(false);
          }
        });
      }
      alert(`単元「${title}」を更新しました！`);
    }
  } else {
    const newId = 'stage_' + Date.now();
    stages.push({
      id: newId,
      classId: stageClassTarget,
      title: title,
      missions: missions,
      summary: summary,
      dialogues: parsedDialogues,
      skill: skill,
      narratorImage: narratorImgDataUrl || null
    });

    // 対象クラスの初期設定を作成
    const targetClasses = stageClassTarget === 'all' ? classes : classes.filter(c => c.id === stageClassTarget);
    targetClasses.forEach(c => {
      if (!classMissionSettings[c.id]) classMissionSettings[c.id] = {};
      classMissionSettings[c.id][newId] = new Array(missions.length).fill(false);
    });

    alert(`新しい単元「${title}」を登録しました！`);
  }

  resetStageForm();
  renderTeacherDashboard();
}

function editStage(stageId) {
  const stg = stages.find(s => s.id === stageId);
  if (!stg) return;

  switchTeacherTab('missions');
  document.getElementById('stage-form-title').innerText = '✏️ 単元・ミッションの編集';
  document.getElementById('editing-stage-id').value = stg.id;
  document.getElementById('stage-title').value = stg.title;
  document.getElementById('stage-missions').value = stg.missions.join('\n');
  const summaryEl = document.getElementById('stage-summary');
  if (summaryEl) summaryEl.value = stg.summary || '';
  document.getElementById('stage-dialogue').value = stg.dialogues.map(d => `${d.speaker}：${d.text}`).join('\n');
  document.getElementById('stage-skill').value = stg.skill;

  // 語り手画像を復元
  narratorImgDataUrl = null; // 変更なし扱い（既存保持）
  const preview = document.getElementById('stage-narrator-preview');
  const img = document.getElementById('stage-narrator-img-preview');
  if (stg.narratorImage) {
    img.src = stg.narratorImage;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }

  const stageClassSel = document.getElementById('stage-class-select');
  if (stageClassSel) stageClassSel.value = stg.classId || 'all';

  document.getElementById('save-stage-btn').innerText = '更新内容を保存する';
  document.getElementById('cancel-edit-btn').classList.remove('hidden');
}

function resetStageForm() {
  document.getElementById('stage-form-title').innerText = '➕ 全クラス共通単元の追加・編集';
  const stageClassSel = document.getElementById('stage-class-select');
  if (stageClassSel) stageClassSel.value = 'all';
  document.getElementById('editing-stage-id').value = '';
  document.getElementById('stage-title').value = '';
  document.getElementById('stage-missions').value = '';
  const summaryReset = document.getElementById('stage-summary');
  if (summaryReset) summaryReset.value = '';
  document.getElementById('stage-dialogue').value = '';
  document.getElementById('stage-skill').value = '';

  // 語り手画像リセット
  narratorImgDataUrl = null;
  document.getElementById('stage-narrator-img').value = '';
  document.getElementById('stage-narrator-preview').style.display = 'none';

  document.getElementById('save-stage-btn').innerText = '単元を登録・更新する';
  document.getElementById('cancel-edit-btn').classList.add('hidden');
}

function deleteStage(stageId) {
  if (confirm('本当にこの単元を削除しますか？')) {
    stages = stages.filter(s => s.id !== stageId);
    classes.forEach(c => {
      if (classMissionSettings[c.id]) delete classMissionSettings[c.id][stageId];
    });
    renderTeacherDashboard();
  }
}

// ガチャ管理
function addGachaItem() {
  const gachaType = document.getElementById('gacha-item-type')?.value || '5';
  const name = document.getElementById('gacha-item-name').value.trim();
  const weight = parseInt(document.getElementById('gacha-item-weight').value);

  if (!name || isNaN(weight) || weight <= 0) {
    alert('正しいアイテム名と確率の重み（正の数値）を入力してください');
    return;
  }

  const gachaClassTarget = document.getElementById('gacha-class-select')?.value || 'all';

  // 性別フィルタ: 両方 or どちらもなし → 'all'
  const isMale   = document.getElementById('gacha-gender-male')?.checked || false;
  const isFemale = document.getElementById('gacha-gender-female')?.checked || false;
  let gender = 'all';
  if (isMale && !isFemale)  gender = 'male';
  if (isFemale && !isMale)  gender = 'female';

  const newItem = { 
    id: 'item_' + Date.now(), 
    name, 
    weight,
    classId: gachaClassTarget,
    gender,
    images: {
      front: gachaImgDataUrls.front,
      side: gachaImgDataUrls.side,
      back: gachaImgDataUrls.back
    }
  };

  gachaPools[gachaType].push(newItem);

  alert(`ガチャアイテム「${name}」を追加しました！`);
  document.getElementById('gacha-item-name').value = '';
  document.getElementById('gacha-item-weight').value = '';
  const gm = document.getElementById('gacha-gender-male');
  const gf = document.getElementById('gacha-gender-female');
  if (gm) gm.checked = false;
  if (gf) gf.checked = false;
  ['gacha-item-img-front','gacha-item-img-side','gacha-item-img-back'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['gacha-prev-front','gacha-prev-side','gacha-prev-back'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.src = ''; el.style.display = 'none'; }
  });
  gachaImgDataUrls = { front: '', side: '', back: '' };

  renderGachaManageList();
}

function deleteGachaItem(poolKey, itemId) {
  if (confirm('このガチャアイテムを削除しますか？')) {
    gachaPools[poolKey] = gachaPools[poolKey].filter(i => i.id !== itemId);
    renderGachaManageList();
  }
}

function renderGachaManageList() {
  const list = document.getElementById('gacha-item-list');
  if (!list) return;

  const poolDefs = [
    { key: '5',  label: '⚪ 初級ガチャ（5 EXP / 1アイテム）' },
    { key: '10', label: '🔵 中級ガチャ（10 EXP / 1アイテム）' },
    { key: '15', label: '🟡 上級ガチャ（15 EXP / 1アイテム）' }
  ];

  const renderItem = (item, poolKey) => {
    const hasImg = item.images && (item.images.front || item.images.side || item.images.back);
    const thumbs = hasImg ? ['front','side','back'].map(d =>
      item.images[d] ? `<img src="${item.images[d]}" title="${d}" style="max-height:48px; border-radius:4px; margin-right:4px;" onerror="this.style.display='none'">` : ''
    ).join('') : '';
    const scopeBadge = item.classId === 'all'
      ? `<span style="font-size:0.7em; background:#4a5568; color:#e2e8f0; border-radius:4px; padding:1px 6px; margin-left:5px;">🌐 全クラス共通</span>`
      : `<span style="font-size:0.7em; background:#553c1a; color:#ecc94b; border-radius:4px; padding:1px 6px; margin-left:5px;">📌 ${classes.find(c=>c.id===item.classId)?.name||item.classId}専用</span>`;
    const genderLabel = { male: '🧑 男性専用', female: '👧 女性専用', all: '👥 全員共通' };
    const genderBadge = `<span style="font-size:0.7em; background:#2d3748; color:#a0aec0; border-radius:4px; padding:1px 6px; margin-left:5px;">${genderLabel[item.gender || 'all'] || '👥 全員共通'}</span>`;
    return `
      <div class="gacha-manage-item">
        <div>
          <b>${item.name}</b>${scopeBadge}${genderBadge} (重み: ${item.weight})
          ${hasImg ? `<br><div style="margin-top:4px;">${thumbs}</div>` : ''}
        </div>
        <button onclick="deleteGachaItem('${poolKey}', '${item.id}')" class="btn-danger" style="font-size:0.75em;">削除</button>
      </div>`;
  };

  let html = '';
  poolDefs.forEach(({ key, label }) => {
    const pool = gachaPools[key];
    html += `<h5 style="margin:18px 0 6px; color:#ecc94b; border-bottom:1px solid #4a5568; padding-bottom:4px;">${label}</h5>`;
    if (pool.length === 0) {
      html += `<p class="hint" style="margin:4px 0;">アイテムが設定されていません</p>`;
    } else {
      pool.forEach(item => { html += renderItem(item, key); });
    }
  });
  list.innerHTML = html;
}

function toggleClassMode() {
  const c = classes.find(cl => cl.id === selectedClassId);
  if (c) {
    c.isClassMode = !c.isClassMode;
    updateClassDisplays();
  }
}

function sortStudentsByToday() {
  students.sort((a, b) => a.todayExp - b.todayExp);
  renderTeacherDashboard();
}

// 生徒画面描画
function renderStudentDashboard(gotBonus) {
  const studentClass = classes.find(c => c.id === currentUser.classId);
  const className = studentClass ? studentClass.name : '';

  const lv = calcLevel(currentUser.totalExp);
  const toNext = expToNextLevel(currentUser.totalExp);
  const pct = expProgressInLevel(currentUser.totalExp);

  document.getElementById('st-name').innerText = currentUser.name;
  document.getElementById('st-class').innerText = className;
  document.getElementById('st-level').innerText = lv;
  document.getElementById('st-pt').innerText = currentUser.exp;
  document.getElementById('st-total').innerText = currentUser.totalExp;
  document.getElementById('st-exp-bar').style.width = pct + '%';
  document.getElementById('st-exp-next').innerText =
    toNext !== null ? `次のレベルまで ${toNext} EXP` : '最大レベル到達！';
  document.getElementById('equipped-item').innerText = `装備: ${currentUser.equipped}`;

  const avatarContainer = document.getElementById('st-avatar-container');
  avatarContainer.innerHTML = renderAvatarWithEquipment(currentUser.avatar, currentUser.equipped);

  const bonusBanner = document.getElementById('bonus-banner');
  if (gotBonus) bonusBanner.classList.remove('hidden');
  else bonusBanner.classList.add('hidden');

  const lockMsg = document.getElementById('class-lock-msg');
  const isMode = studentClass ? studentClass.isClassMode : false;
  if (isMode) lockMsg.classList.remove('hidden');
  else lockMsg.classList.add('hidden');

  // もちもの
  const itemList = document.getElementById('item-list');
  itemList.innerHTML = '';
  if (currentUser.items.length === 0) {
    itemList.innerHTML = '<li class="empty">持っているアイテムはありません</li>';
  } else {
    // 同名アイテムをまとめて「名前×数」表示
    const itemCounts = {};
    currentUser.items.forEach(item => { itemCounts[item] = (itemCounts[item] || 0) + 1; });
    Object.entries(itemCounts).forEach(([item, count]) => {
      const li = document.createElement('li');
      const isEquipped = currentUser.equipped === item;
      const countStr = count > 1 ? ` <span style="color:#ecc94b; font-weight:bold;">×${count}</span>` : '';
      li.innerHTML = `
        <span>🎁 ${item}${countStr} ${isEquipped ? '<b>(装備中)</b>' : ''}</span>
        ${!isMode ? `<button onclick="toggleEquip('${item}')">${isEquipped ? '外す' : '装備する'}</button>` : ''}
      `;
      itemList.appendChild(li);
    });
  }

  // スキル
  const skillList = document.getElementById('skill-list');
  skillList.innerHTML = '';
  if (currentUser.skills.length === 0) {
    skillList.innerHTML = '<li class="empty">まだ習得している技はありません</li>';
  } else {
    currentUser.skills.forEach(sk => {
      const li = document.createElement('li');
      li.innerText = `🗡️ 【技】${sk}`;
      skillList.appendChild(li);
    });
  }

  // 掲示板
  renderStudentBulletin();

  // 学習マップ描画（所属クラスの解放状況を参照）
  const mapContainer = document.getElementById('map-container');
  mapContainer.innerHTML = '';

  const classSettings = classMissionSettings[currentUser.classId] || {};

  // このクラスに適用される単元だけマップに表示
  // 未達成を左に、クリア済みは追加順で右に並べる
  const visibleStages = stages.filter(s => s.classId === 'all' || s.classId === currentUser.classId);
  const incompleteStages = visibleStages.filter(stg => {
    const prog = (currentUser.progress && currentUser.progress[stg.id]) || 0;
    return prog < stg.missions.length;
  });
  const clearedStages = visibleStages.filter(stg => {
    const prog = (currentUser.progress && currentUser.progress[stg.id]) || 0;
    return prog >= stg.missions.length;
  });

  [...incompleteStages, ...clearedStages].forEach(stg => {
    const settings = classSettings[stg.id] || new Array(stg.missions.length).fill(false);
    const unlockedCount = settings.filter(Boolean).length;

    const div = document.createElement('div');
    div.className = 'stage-building';
    div.onclick = () => startAdventure(stg.id);

    const prog = (currentUser.progress && currentUser.progress[stg.id]) || 0;
    const isCompleted = prog >= stg.missions.length;

    div.innerHTML = `
      🏛️<br><b>${stg.title}</b><br>
      <small style="color:${isCompleted ? '#48bb78' : '#ecc94b'};">
        ${isCompleted ? 'クリア済み' : `進行度: ${prog}/${stg.missions.length}`}
      </small><br>
      <small style="color:#a0aec0; font-size:0.75em;">
        解放ミッション: ${unlockedCount}/${stg.missions.length}
      </small>
    `;
    mapContainer.appendChild(div);
  });
}

function toggleEquip(itemName) {
  const studentClass = classes.find(c => c.id === currentUser.classId);
  if (studentClass && studentClass.isClassMode) return;
  currentUser.equipped = (currentUser.equipped === itemName) ? 'なし' : itemName;
  renderStudentDashboard(false);
}

// アドベンチャー画面
function startAdventure(stageId) {
  currentStage = stages.find(s => s.id === stageId);
  currentDialogueIndex = 0;
  document.getElementById('adv-title').innerText = `単元: ${currentStage.title}`;

  // 語り手画像を表示（正方形ポートレート）
  const portrait = document.getElementById('narrator-portrait');
  if (currentStage.narratorImage) {
    portrait.innerHTML = `<img src="${currentStage.narratorImage}" style="width:100%; height:100%; object-fit:cover; border-radius:6px; display:block;">`;
  } else {
    portrait.innerHTML = '📖';
  }

  showScreen('adventure-screen');
  renderMissionStatus();
  updateDialogue();
}

function renderMissionStatus() {
  const container = document.getElementById('adv-mission-list');
  container.innerHTML = '';

  const classSettings = classMissionSettings[currentUser.classId] || {};
  const settings = classSettings[currentStage.id] || [];
  const clearedCount = (currentUser.progress && currentUser.progress[currentStage.id]) || 0;
  const totalMissions = currentStage.missions.length;

  currentStage.missions.forEach((mText, idx) => {
    const isUnlocked = settings[idx] || false;
    const isCleared = idx < clearedCount;

    const div = document.createElement('div');

    if (!isUnlocked) {
      div.className = 'mission-item locked';
      div.innerText = `🔒 ??? (まだ解放されていません)`;
    } else if (isCleared) {
      div.className = 'mission-item cleared';
      div.innerText = `✅ ${mText}`;
    } else {
      div.className = 'mission-item active';
      div.innerText = `🔓 ${mText} (未達成)`;
    }

    container.appendChild(div);
  });

  const allCleared = clearedCount >= totalMissions;

  // 単元のまとめ（全ミッション達成後のみ表示）
  const summaryDiv = document.getElementById('adv-summary');
  if (summaryDiv) {
    if (allCleared && currentStage.summary) {
      summaryDiv.innerHTML = `
        <div class="stage-summary-box">
          <h4>📝 単元のまとめ</h4>
          <p>${currentStage.summary.replace(/\n/g, '<br>')}</p>
        </div>`;
    } else {
      summaryDiv.innerHTML = '';
    }
  }

  // 獲得スキル表示
  const skillDiv = document.getElementById('adv-acquired-skill');
  if (skillDiv && currentStage.skill) {
    if (allCleared) {
      skillDiv.innerHTML = `
        <div class="skill-acquired-box skill-acquired-done">
          ✨ 獲得スキル: <strong>「${currentStage.skill}」</strong>
        </div>`;
    } else {
      skillDiv.innerHTML = `
        <div class="skill-acquired-box skill-acquired-locked">
          🔒 全ミッション達成で<strong>「${currentStage.skill}」</strong>を習得できます
        </div>`;
    }
  }
}

function updateDialogue() {
  const current = currentStage.dialogues[currentDialogueIndex];
  document.getElementById('speaker-name').innerText = current.speaker;
  document.getElementById('dialogue-text').innerText = current.text;
  document.getElementById('next-dialogue-btn').innerText = (currentDialogueIndex === currentStage.dialogues.length - 1) ? 'もう一度読む' : '次へ ▶';
}

function nextDialogue() {
  if (currentDialogueIndex < currentStage.dialogues.length - 1) {
    currentDialogueIndex++;
    updateDialogue();
  } else {
    currentDialogueIndex = 0;
    updateDialogue();
  }
}

// ガチャ
function openGachaModal() {
  const studentClass = classes.find(c => c.id === currentUser.classId);
  const isMode = studentClass ? studentClass.isClassMode : false;

  const lockMsg = document.getElementById('gacha-lock-msg');
  const body = document.getElementById('gacha-body');

  if (isMode) {
    lockMsg.classList.remove('hidden');
    body.classList.add('hidden');
  } else {
    lockMsg.classList.add('hidden');
    body.classList.remove('hidden');
    document.getElementById('gacha-user-pt').innerText = currentUser.exp;
    document.getElementById('gacha-result').classList.add('hidden');
  }
  document.getElementById('gacha-modal').classList.remove('hidden');
}

function closeGachaModal() {
  document.getElementById('gacha-modal').classList.add('hidden');
  renderStudentDashboard(false);
}

// ============================================================
// 掲示板機能
// ============================================================

// ファイルをbase64 dataURLとして読み込む
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`「${file.name}」は10MBを超えているためスキップされました。`);
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => resolve({ name: file.name, type: file.type, data: e.target.result });
    reader.onerror = () => reject(new Error('ファイル読み込みエラー'));
    reader.readAsDataURL(file);
  });
}

// ファイルチップアイコン取得
function fileIcon(type) {
  if (type.startsWith('image/'))                      return '🖼️';
  if (type === 'application/pdf')                     return '📄';
  if (type.includes('word') || type.includes('odt'))  return '📝';
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return '📊';
  return '📎';
}

async function saveBulletin() {
  const editId = document.getElementById('editing-bulletin-id').value;
  const title  = document.getElementById('bulletin-title').value.trim();
  const body   = document.getElementById('bulletin-body').value.trim();
  const isPublished = document.getElementById('bulletin-publish').checked;

  if (!title || !body) {
    alert('タイトルと本文を入力してください');
    return;
  }

  // 新規選択ファイルを読み込む
  const fileInput = document.getElementById('bulletin-file');
  const selectedFiles = fileInput ? Array.from(fileInput.files) : [];
  const newFileResults = await Promise.all(selectedFiles.map(readFileAsBase64));
  const newFiles = newFileResults.filter(Boolean);

  if (editId) {
    const ann = announcements.find(a => a.id === editId);
    if (ann) {
      ann.title = title;
      ann.body = body;
      ann.isPublished = isPublished;
      ann.updatedAt = Date.now();
      // 既存ファイルを保持して新ファイルを追記
      ann.files = [...(ann.files || []), ...newFiles];
    }
  } else {
    const bulletinClassTarget = document.getElementById('bulletin-class-select')?.value || selectedClassId;
    announcements.push({
      id: 'ann_' + Date.now(),
      classId: bulletinClassTarget,
      title,
      body,
      isPublished,
      files: newFiles,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  resetBulletinForm();
  renderBulletinManageList();
}

function editBulletin(annId) {
  const ann = announcements.find(a => a.id === annId);
  if (!ann) return;

  document.getElementById('bulletin-form-title').innerText = '✏️ 連絡を編集する';
  document.getElementById('editing-bulletin-id').value = ann.id;
  document.getElementById('bulletin-title').value = ann.title;
  document.getElementById('bulletin-body').value = ann.body;
  document.getElementById('bulletin-publish').checked = ann.isPublished;
  document.getElementById('save-bulletin-btn').innerText = '更新する';
  document.getElementById('cancel-bulletin-btn').classList.remove('hidden');
  switchTeacherTab('bulletin');
}

function deleteBulletin(annId) {
  if (confirm('この連絡を削除しますか？')) {
    announcements = announcements.filter(a => a.id !== annId);
    renderBulletinManageList();
  }
}

function toggleBulletinPublish(annId) {
  const ann = announcements.find(a => a.id === annId);
  if (ann) {
    ann.isPublished = !ann.isPublished;
    ann.updatedAt = Date.now();
    renderBulletinManageList();
  }
}

function resetBulletinForm() {
  document.getElementById('bulletin-form-title').innerText = '➕ 新しい連絡を投稿する';
  document.getElementById('editing-bulletin-id').value = '';
  document.getElementById('bulletin-title').value = '';
  document.getElementById('bulletin-body').value = '';
  document.getElementById('bulletin-publish').checked = false;
  document.getElementById('save-bulletin-btn').innerText = '投稿する';
  document.getElementById('cancel-bulletin-btn').classList.add('hidden');
  const bsel = document.getElementById('bulletin-class-select');
  if (bsel) bsel.value = selectedClassId;
  // ファイル入力をリセット
  const fi = document.getElementById('bulletin-file');
  if (fi) fi.value = '';
  const prev = document.getElementById('bulletin-file-preview');
  if (prev) prev.innerHTML = '';
}

function renderBulletinManageList() {
  const list = document.getElementById('bulletin-manage-list');
  if (!list) return;

  const classAnn = announcements.filter(a => a.classId === selectedClassId || a.classId === 'all');

  if (classAnn.length === 0) {
    list.innerHTML = '<p class="hint">このクラスへの投稿はまだありません。</p>';
    return;
  }

  list.innerHTML = '';
  [...classAnn].sort((a, b) => b.createdAt - a.createdAt).forEach(ann => {
    const date = new Date(ann.createdAt).toLocaleDateString('ja-JP');
    const annScopeBadge = ann.classId === 'all'
      ? `<span style="font-size:0.7em; background:#4a5568; color:#e2e8f0; border-radius:4px; padding:1px 6px;">🌐 全クラス</span>`
      : `<span style="font-size:0.7em; background:#553c1a; color:#ecc94b; border-radius:4px; padding:1px 6px;">📌 このクラス専用</span>`;

    // 添付ファイル一覧（教員用：削除ボタン付き）
    const filesHtml = (ann.files || []).length > 0
      ? `<div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:5px;">` +
        (ann.files || []).map((f, i) =>
          `<span class="file-chip">${fileIcon(f.type)} ${f.name}
            <button onclick="removeBulletinFile('${ann.id}',${i})" title="削除"
              style="background:none;border:none;color:#fc8181;cursor:pointer;font-size:0.85em;padding:0 2px;">✕</button>
          </span>`
        ).join('') + `</div>`
      : '';

    const div = document.createElement('div');
    div.className = 'bulletin-manage-item';
    div.innerHTML = `
      <div style="flex:1; min-width:0;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
          <strong style="font-size:1em;">${ann.title}</strong>
          ${annScopeBadge}
          <span class="bulletin-badge ${ann.isPublished ? 'badge-published' : 'badge-draft'}">
            ${ann.isPublished ? '🟢 公開中' : '⬜ 下書き'}
          </span>
          <small style="color:#a0aec0;">${date}</small>
        </div>
        <p style="margin:0; font-size:0.85em; color:#c0c0d0; white-space:pre-wrap; word-break:break-word;">${ann.body}</p>
        ${filesHtml}
      </div>
      <div style="display:flex; flex-direction:column; gap:6px; margin-left:12px; flex-shrink:0;">
        <button onclick="toggleBulletinPublish('${ann.id}')" class="${ann.isPublished ? 'btn-secondary' : 'btn-success'}" style="font-size:0.75em; padding:4px 8px;">
          ${ann.isPublished ? '下書きに戻す' : '公開する'}
        </button>
        <button onclick="editBulletin('${ann.id}')" class="btn-secondary" style="font-size:0.75em; padding:4px 8px;">編集</button>
        <button onclick="deleteBulletin('${ann.id}')" class="btn-danger" style="font-size:0.75em; padding:4px 8px;">削除</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// 生徒画面の掲示板表示
function renderStudentBulletin() {
  const listEl = document.getElementById('student-bulletin-list');
  if (!listEl) return;

  const published = announcements.filter(
    a => (a.classId === currentUser.classId || a.classId === 'all') && a.isPublished
  ).sort((a, b) => b.createdAt - a.createdAt);

  if (published.length === 0) {
    listEl.innerHTML = '<p style="color:#a0aec0; font-size:0.9em;">お知らせはありません</p>';
    return;
  }

  listEl.innerHTML = '';
  published.forEach(ann => {
    const date = new Date(ann.createdAt).toLocaleDateString('ja-JP');

    // 添付ファイル（生徒用：画像プレビュー＋ダウンロードボタン）
    let filesHtml = '';
    if ((ann.files || []).length > 0) {
      filesHtml = `<div class="ann-files-student">`;
      ann.files.forEach((f, i) => {
        if (f.type.startsWith('image/')) {
          filesHtml += `
            <div class="ann-file-block">
              <img src="${f.data}" alt="${f.name}" style="max-width:100%; max-height:280px; border-radius:6px; display:block; margin-bottom:5px;">
              <button onclick="downloadAnnFile('${ann.id}',${i})" class="btn-secondary" style="font-size:0.8em; padding:4px 12px;">⬇️ ${f.name} をダウンロード</button>
            </div>`;
        } else {
          filesHtml += `
            <button onclick="downloadAnnFile('${ann.id}',${i})" class="btn-secondary ann-file-dl-btn">
              ${fileIcon(f.type)} ${f.name} をダウンロード
            </button>`;
        }
      });
      filesHtml += `</div>`;
    }

    const div = document.createElement('div');
    div.className = 'bulletin-student-item';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
        <strong style="font-size:1em; color:#ecc94b;">${ann.title}</strong>
        <small style="color:#a0aec0; flex-shrink:0; margin-left:8px;">${date}</small>
      </div>
      <p style="margin:0 0 8px; font-size:0.9em; line-height:1.6; white-space:pre-wrap; word-break:break-word;">${ann.body}</p>
      ${filesHtml}
    `;
    listEl.appendChild(div);
  });
}

// ファイルダウンロード（生徒用）
window.downloadAnnFile = function(annId, idx) {
  const ann = announcements.find(a => a.id === annId);
  if (!ann || !(ann.files || [])[idx]) return;
  const f = ann.files[idx];
  const a = document.createElement('a');
  a.href = f.data;
  a.download = f.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 添付ファイルを教員管理一覧から削除
window.removeBulletinFile = function(annId, idx) {
  const ann = announcements.find(a => a.id === annId);
  if (!ann || !ann.files) return;
  ann.files.splice(idx, 1);
  renderBulletinManageList();
};

function drawRarityItem(pool) {
  if (pool.length === 0) return 'なし';
  const totalWeight = pool.reduce((sum, i) => sum + i.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of pool) {
    if (random < item.weight) return item.name;
    random -= item.weight;
  }
  return pool[0].name;
}

function playGacha(cost) {
  // cost = 5(初級) / 10(中級) / 15(上級)、各1アイテム排出
  const labelMap = { 5: '初級', 10: '中級', 15: '上級' };
  const label = labelMap[cost] || String(cost);

  if (currentUser.exp < cost) {
    alert(`経験値が足りません！（必要: ${cost} EXP）`);
    return;
  }

  // アバターから性別を判定（boy.png → male, girl.png → female）
  const avatarGender = (currentUser.avatar || '').includes('girl') ? 'female' : 'male';

  const rawPool = gachaPools[String(cost)] || [];
  const pool = rawPool.filter(i =>
    (i.classId === 'all' || i.classId === currentUser.classId) &&
    (i.gender === 'all' || !i.gender || i.gender === avatarGender)
  );
  if (pool.length === 0) {
    alert(`${label}ガチャにアイテムが設定されていません`);
    return;
  }

  currentUser.exp -= cost;
  document.getElementById('gacha-user-pt').innerText = currentUser.exp;

  const reward = drawRarityItem(pool);
  currentUser.items.push(reward);

  // 同名アイテムが11個になったら10個をEXP5に自動交換（1個は必ず残す）
  const itemCount = currentUser.items.filter(i => i === reward).length;
  let exchangeMsg = '';
  if (itemCount >= 11) {
    let removed = 0;
    currentUser.items = currentUser.items.filter(i => {
      if (i === reward && removed < 10) { removed++; return false; }
      return true;
    });
    currentUser.exp += 5;
    currentUser.totalExp += 5;
    document.getElementById('gacha-user-pt').innerText = currentUser.exp;
    exchangeMsg = `<br><span style="color:#68d391;">✨ 「${reward}」が10個集まったので EXP×5 に交換しました！（1個残し）</span>`;
  }

  const resultBox = document.getElementById('gacha-result');
  resultBox.innerHTML = `🎉 ${label}ガチャ結果: 「${reward}」 を獲得しました！（もちものに追加）${exchangeMsg}`;
  resultBox.classList.remove('hidden');
}

// ============================================================
// クラス全員一括達成数変更（インライン onclick から呼ばれるため window に登録）
// ============================================================

window.changeAllStudentsProgress = function(delta) {
  const stageId = document.getElementById('bulk-stage-select')?.value;
  if (!stageId) { alert('対象単元を選んでください'); return; }
  const stg = stages.find(s => s.id === stageId);
  if (!stg) return;

  const classStudents = students.filter(s => s.classId === selectedClassId);
  if (classStudents.length === 0) { alert('このクラスに生徒がいません'); return; }

  classStudents.forEach(st => {
    if (!st.progress) st.progress = {};
    if (!st.progress[stageId]) st.progress[stageId] = 0;
    st.progress[stageId] = Math.max(0, Math.min(stg.missions.length, st.progress[stageId] + delta));
    if (st.progress[stageId] === stg.missions.length && !st.skills.includes(stg.skill)) {
      st.skills.push(stg.skill);
    }
  });
  renderStudentGrid();
  const dir = delta > 0 ? `+${delta}` : `${delta}`;
  alert(`「${stg.title}」の達成数を全員 ${dir} しました。`);
};

window.setAllStudentsProgress = function(value) {
  const stageId = document.getElementById('bulk-stage-select')?.value;
  if (!stageId) { alert('対象単元を選んでください'); return; }
  const stg = stages.find(s => s.id === stageId);
  if (!stg) return;

  const classStudents = students.filter(s => s.classId === selectedClassId);
  if (classStudents.length === 0) { alert('このクラスに生徒がいません'); return; }

  const actual = Math.max(0, Math.min(stg.missions.length, value));
  const label = actual >= stg.missions.length ? 'クリア状態' : `${actual}件達成`;
  if (!confirm(`「${stg.title}」の達成数を全員 ${label} にリセットしますか？`)) return;

  classStudents.forEach(st => {
    if (!st.progress) st.progress = {};
    st.progress[stageId] = actual;
    if (actual === stg.missions.length && !st.skills.includes(stg.skill)) {
      st.skills.push(stg.skill);
    }
  });
  renderStudentGrid();
  alert(`「${stg.title}」の達成数を全員 ${label} にしました。`);
};

// ============================================================
// パスワード表示トグル（教員画面 生徒カード）
// ============================================================
window.togglePwDisplay = function(studentId) {
  const disp  = document.getElementById(`pw-disp-${studentId}`);
  const mask  = document.getElementById(`pw-mask-${studentId}`);
  const btn   = document.getElementById(`pw-toggle-${studentId}`);
  if (!disp || !mask || !btn) return;
  const showing = disp.style.display !== 'none';
  disp.style.display = showing ? 'none'   : 'inline';
  mask.style.display  = showing ? 'inline' : 'none';
  btn.innerText       = showing ? '表示'   : '隠す';
};

// ============================================================
// 生徒画面 パスワード変更
// ============================================================
window.changePassword = function() {
  const current = document.getElementById('pw-current').value;
  const newPw   = document.getElementById('pw-new').value;
  const confirm = document.getElementById('pw-confirm').value;
  const msg     = document.getElementById('pw-change-msg');

  if (current !== currentUser.pass) {
    msg.style.color = '#e53e3e';
    msg.innerText = '❌ 現在のパスワードが違います';
    return;
  }
  if (newPw.length < 4) {
    msg.style.color = '#e53e3e';
    msg.innerText = '❌ パスワードは4文字以上で設定してください';
    return;
  }
  if (newPw !== confirm) {
    msg.style.color = '#e53e3e';
    msg.innerText = '❌ 新しいパスワードが一致しません';
    return;
  }
  currentUser.pass = newPw;
  ['pw-current','pw-new','pw-confirm'].forEach(id => document.getElementById(id).value = '');
  msg.style.color = '#48bb78';
  msg.innerText = '✅ パスワードを変更しました！';
  setTimeout(() => { msg.innerText = ''; }, 3000);
};

// ============================================================
// クラス・生徒管理タブ
// ============================================================

/** タブ全体を再描画 */
function renderClassManageTab() {
  renderClassList();
  renderStudentManageList();
  renderTransferSelects();
}

/** クラス一覧 */
function renderClassList() {
  const container = document.getElementById('class-manage-list');
  if (!container) return;
  container.innerHTML = '';
  if (classes.length === 0) {
    container.innerHTML = '<p class="hint">クラスがありません。上のフォームから追加してください。</p>';
    return;
  }
  classes.forEach(cls => {
    const count = students.filter(s => s.classId === cls.id).length;
    const div = document.createElement('div');
    div.className = 'manage-row';
    div.innerHTML = `
      <div>
        <b>${cls.name}</b>
        <span style="color:#a0aec0; font-size:0.85em; margin-left:8px;">生徒数: ${count}人</span>
      </div>
      <button onclick="deleteClassBtn('${cls.id}')" class="btn-danger" style="font-size:0.8em; padding:4px 10px;">削除</button>
    `;
    container.appendChild(div);
  });
}

/** 生徒一覧（パスワード確認・削除） */
function renderStudentManageList() {
  const container = document.getElementById('student-manage-list');
  const label     = document.getElementById('manage-class-display');
  if (!container) return;
  const cls = classes.find(c => c.id === selectedClassId);
  if (label) label.innerText = cls ? cls.name : '—';

  const classStudents = students.filter(s => s.classId === selectedClassId);
  if (classStudents.length === 0) {
    container.innerHTML = '<p class="hint">このクラスに生徒はいません。</p>';
    return;
  }
  container.innerHTML = '';
  classStudents.forEach(st => {
    const div = document.createElement('div');
    div.className = 'manage-row';
    div.innerHTML = `
      <div>
        <b>${st.name}</b>
        <span style="color:#a0aec0; font-size:0.82em; margin-left:8px;">ID: <code>${st.id}</code></span><br>
        <span style="font-size:0.82em;">🔑 PW:
          <span id="mpw-disp-${st.id}" style="display:none;" class="pw-badge">${st.pass}</span>
          <span id="mpw-mask-${st.id}">••••</span>
          <button class="pw-toggle-btn" id="mpw-toggle-${st.id}" onclick="toggleManagePw('${st.id}')">表示</button>
        </span>
      </div>
      <button onclick="removeStudentBtn('${st.id}')" class="btn-danger" style="font-size:0.8em; padding:4px 10px;">削除</button>
    `;
    container.appendChild(div);
  });
}

window.toggleManagePw = function(studentId) {
  const disp = document.getElementById(`mpw-disp-${studentId}`);
  const mask = document.getElementById(`mpw-mask-${studentId}`);
  const btn  = document.getElementById(`mpw-toggle-${studentId}`);
  if (!disp || !mask || !btn) return;
  const showing = disp.style.display !== 'none';
  disp.style.display = showing ? 'none' : 'inline';
  mask.style.display  = showing ? 'inline' : 'none';
  btn.innerText       = showing ? '表示' : '隠す';
};

/** 転籍用セレクトの更新 */
function renderTransferSelects() {
  const studentSel = document.getElementById('transfer-student-select');
  const classSel   = document.getElementById('transfer-class-select');
  if (!studentSel || !classSel) return;

  studentSel.innerHTML = '<option value="">生徒を選択…</option>';
  [...students].sort((a, b) => {
    const ca = classes.find(c => c.id === a.classId)?.name || '';
    const cb = classes.find(c => c.id === b.classId)?.name || '';
    return ca.localeCompare(cb) || a.name.localeCompare(b.name);
  }).forEach(st => {
    const cls = classes.find(c => c.id === st.classId);
    const opt = document.createElement('option');
    opt.value    = st.id;
    opt.innerText = `${st.name}（${cls ? cls.name : '?'}）`;
    studentSel.appendChild(opt);
  });

  classSel.innerHTML = '<option value="">転籍先クラスを選択…</option>';
  classes.forEach(cls => {
    const opt = document.createElement('option');
    opt.value    = cls.id;
    opt.innerText = cls.name;
    classSel.appendChild(opt);
  });
}

// ---- ボタンアクション（window登録でインラインonclickから呼べるように） ----

/** クラス追加 */
window.addClassBtn = function() {
  const name = document.getElementById('new-class-name').value.trim();
  if (!name) { alert('クラス名を入力してください'); return; }
  if (classes.find(c => c.name === name)) { alert('同じ名前のクラスが既に存在します'); return; }
  const id = 'cls_' + Date.now();
  classes.push({ id, name, isClassMode: false });
  classMissionSettings[id] = {};
  document.getElementById('new-class-name').value = '';
  initClassSelect();
  populateClassFormSelects();
  renderClassManageTab();
  alert(`クラス「${name}」を追加しました！`);
};

/** クラス削除 */
window.deleteClassBtn = function(classId) {
  const cls = classes.find(c => c.id === classId);
  if (!cls) return;
  const count = students.filter(s => s.classId === classId).length;
  const msg = count > 0
    ? `「${cls.name}」には ${count} 人の生徒がいます。\nクラスと生徒データをすべて削除しますか？`
    : `クラス「${cls.name}」を削除しますか？`;
  if (!confirm(msg)) return;

  students = students.filter(s => s.classId !== classId);
  classes  = classes.filter(c => c.id !== classId);
  delete classMissionSettings[classId];
  if (selectedClassId === classId) {
    selectedClassId = classes.length > 0 ? classes[0].id : '';
  }
  initClassSelect();
  populateClassFormSelects();
  renderTeacherDashboard();
  renderClassManageTab();
};

/** 生徒追加 */
window.addStudentBtn = function() {
  const name = document.getElementById('new-student-name').value.trim();
  const id   = document.getElementById('new-student-id').value.trim();
  const pass = document.getElementById('new-student-pass').value.trim();

  if (!name || !id || !pass) { alert('名前・ID・パスワードをすべて入力してください'); return; }
  if (pass.length < 4)       { alert('パスワードは4文字以上で設定してください'); return; }
  if (students.find(s => s.id === id)) { alert(`ID「${id}」は既に使用されています`); return; }
  if (!selectedClassId)      { alert('追加先のクラスが選択されていません'); return; }

  students.push({
    id, name, classId: selectedClassId, pass,
    avatar: null,
    exp: 0, totalExp: 0, todayExp: 0, checkedInToday: false,
    skills: [], items: [], equipped: 'なし', progress: {}
  });

  ['new-student-name','new-student-id','new-student-pass'].forEach(elId =>
    document.getElementById(elId).value = ''
  );
  renderTeacherDashboard();
  renderClassManageTab();
  alert(`生徒「${name}」(ID: ${id}) を追加しました！`);
};

/** 生徒削除 */
window.removeStudentBtn = function(studentId) {
  const st = students.find(s => s.id === studentId);
  if (!st) return;
  if (!confirm(`生徒「${st.name}」を削除しますか？\nすべてのデータが失われます。`)) return;
  students = students.filter(s => s.id !== studentId);
  renderTeacherDashboard();
  renderClassManageTab();
};

/** 転籍 */
window.transferStudentBtn = function() {
  const studentId  = document.getElementById('transfer-student-select').value;
  const newClassId = document.getElementById('transfer-class-select').value;
  if (!studentId || !newClassId) { alert('生徒とクラスを両方選択してください'); return; }

  const st     = students.find(s => s.id === studentId);
  const newCls = classes.find(c => c.id === newClassId);
  if (!st || !newCls) return;
  if (st.classId === newClassId) { alert('すでにそのクラスに所属しています'); return; }

  const oldCls = classes.find(c => c.id === st.classId);
  if (!confirm(
    `「${st.name}」を「${oldCls?.name ?? '?'}」→「${newCls.name}」に変更しますか？\n` +
    `EXP・アイテム・スキル・進捗はすべて引き継がれます。`
  )) return;

  st.classId       = newClassId;
  st.checkedInToday = false; // 本日分はリセット
  st.todayExp      = 0;

  renderTeacherDashboard();
  renderClassManageTab();
  alert(`「${st.name}」を「${newCls.name}」に転籍しました。`);
};

// ============================================================
// フォーム用クラスセレクト・一括単元セレクトの動的生成
// ============================================================

function populateClassFormSelects() {
  const allOpt = '<option value="all">🌐 全クラス共通</option>';
  const classOpts = classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  // 単元フォーム・ガチャフォーム
  ['stage-class-select', 'gacha-class-select'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = el.value;
    el.innerHTML = allOpt + classOpts;
    if ([...el.options].some(o => o.value === cur)) el.value = cur;
  });

  // 掲示板フォーム（全クラスに送信）
  const bsel = document.getElementById('bulletin-class-select');
  if (bsel) {
    const cur = bsel.value;
    bsel.innerHTML = '<option value="all">🌐 全クラスに送信</option>' + classOpts;
    if ([...bsel.options].some(o => o.value === cur)) bsel.value = cur;
    else bsel.value = selectedClassId || 'all';
  }
}

function populateBulkStageSelect() {
  const el = document.getElementById('bulk-stage-select');
  if (!el) return;
  const visibleStages = stages.filter(s => s.classId === 'all' || s.classId === selectedClassId);
  if (visibleStages.length === 0) {
    el.innerHTML = '<option value="">（このクラスに単元がありません）</option>';
    return;
  }
  const cur = el.value;
  el.innerHTML = visibleStages.map(s => `<option value="${s.id}">${s.title}</option>`).join('');
  if ([...el.options].some(o => o.value === cur)) el.value = cur;
}

// ============================================================
// クラス全員一括達成数変更
// ============================================================

window.changeAllStudentsProgress = function(delta) {
  const stageId = document.getElementById('bulk-stage-select')?.value;
  if (!stageId) { alert('対象単元を選んでください'); return; }
  const stg = stages.find(s => s.id === stageId);
  if (!stg) return;

  const classStudents = students.filter(s => s.classId === selectedClassId);
  if (classStudents.length === 0) { alert('このクラスに生徒がいません'); return; }

  classStudents.forEach(st => {
    if (!st.progress) st.progress = {};
    if (!st.progress[stageId]) st.progress[stageId] = 0;
    st.progress[stageId] = Math.max(0, Math.min(stg.missions.length, st.progress[stageId] + delta));
    // クリア時スキル付与
    if (st.progress[stageId] === stg.missions.length && !st.skills.includes(stg.skill)) {
      st.skills.push(stg.skill);
    }
  });

  renderStudentGrid();
  const dir = delta > 0 ? `+${delta}` : `${delta}`;
  alert(`「${stg.title}」の達成数を全員 ${dir} しました。`);
};

window.setAllStudentsProgress = function(value) {
  const stageId = document.getElementById('bulk-stage-select')?.value;
  if (!stageId) { alert('対象単元を選んでください'); return; }
  const stg = stages.find(s => s.id === stageId);
  if (!stg) return;

  const classStudents = students.filter(s => s.classId === selectedClassId);
  if (classStudents.length === 0) { alert('このクラスに生徒がいません'); return; }

  const actual = Math.max(0, Math.min(stg.missions.length, value));
  const label = actual >= stg.missions.length ? 'クリア状態' : `${actual}件達成`;

  if (!confirm(`「${stg.title}」の達成数を全員 ${label} にリセットしますか？`)) return;

  classStudents.forEach(st => {
    if (!st.progress) st.progress = {};
    st.progress[stageId] = actual;
    if (actual === stg.missions.length && !st.skills.includes(stg.skill)) {
      st.skills.push(stg.skill);
    }
  });

  renderStudentGrid();
  alert(`「${stg.title}」の達成数を全員 ${label} にしました。`);
};
