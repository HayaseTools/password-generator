// DOM要素
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const uppercaseCb = document.getElementById('uppercaseCb');
const lowercaseCb = document.getElementById('lowercaseCb');
const numbersCb = document.getElementById('numbersCb');
const symbolsCb = document.getElementById('symbolsCb');
const generateBtn = document.getElementById('generateBtn');
const passwordDisplay = document.getElementById('result');
const copyBtn = document.getElementById('copyBtn');
const strengthText = document.getElementById('strengthText');
const bars = [
    document.getElementById('bar1'),
    document.getElementById('bar2'),
    document.getElementById('bar3'),
    document.getElementById('bar4')
];
const toast = document.getElementById('toast');
const resultContainer = document.querySelector('.result-container');

// 文字セット
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

// 初期化
let currentPassword = '';

// イベントリスナー
lengthSlider.addEventListener('input', (e) => {
    lengthValue.textContent = e.target.value;
});

generateBtn.addEventListener('click', generatePassword);

copyBtn.addEventListener('click', () => {
    if (!currentPassword) return;
    
    // クリップボードAPIを使用したコピー
    navigator.clipboard.writeText(currentPassword).then(() => {
        showToast();
    }).catch(err => {
        console.error('Copy failed', err);
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = currentPassword;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast();
    });
});

// セキュアなパスワード生成
function generatePassword() {
    const length = +lengthSlider.value;
    let charset = '';
    
    if (uppercaseCb.checked) charset += uppercaseChars;
    if (lowercaseCb.checked) charset += lowercaseChars;
    if (numbersCb.checked) charset += numberChars;
    if (symbolsCb.checked) charset += symbolChars;

    if (charset === '') {
        passwordDisplay.innerHTML = '<span class="placeholder">オプションを1つ以上選択してください</span>';
        currentPassword = '';
        updateStrength(0);
        return;
    }

    let password = '';
    const charsetLength = charset.length;
    
    // 暗号学的に安全な乱数生成器を使用 (Math.randomはセキュリティツールでは使用しない)
    const randomArray = new Uint32Array(length);
    window.crypto.getRandomValues(randomArray);

    for (let i = 0; i < length; i++) {
        password += charset[randomArray[i] % charsetLength];
    }

    currentPassword = password;
    
    // XSS対策：生成結果はテキストとして安全だが、念のためエスケープ
    passwordDisplay.textContent = password;
    passwordDisplay.style.color = 'var(--text-primary)';
    
    // 強度計算とUI更新
    calculateStrength(password);
}

// パスワード強度の計算と表示
function calculateStrength(password) {
    let strength = 0;
    
    // 長さによる加点
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (password.length >= 16) strength += 1;

    // 複雑さによる加点
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // 最大4段階に正規化
    let finalStrength = 0;
    if (strength < 3) finalStrength = 1;      // Weak
    else if (strength < 5) finalStrength = 2; // Medium
    else if (strength < 7) finalStrength = 3; // Good
    else finalStrength = 4;                   // Strong

    // 短すぎる場合は即座にWeak
    if (password.length < 8) finalStrength = 1;

    updateStrength(finalStrength);
}

// 強度メーターのUI更新
function updateStrength(level) {
    const colors = [
        'rgba(255,255,255,0.1)', // Empty
        'var(--strength-very-weak)', // 1: Red
        'var(--strength-weak)',      // 2: Orange
        'var(--strength-good)',      // 3: Yellow
        'var(--strength-strong)'     // 4: Green
    ];

    const labels = ['VERY WEAK', 'WEAK', 'MEDIUM', 'GOOD', 'STRONG'];
    
    strengthText.textContent = labels[level] || 'VERY WEAK';
    strengthText.style.color = level === 0 ? 'var(--text-muted)' : colors[level];

    // 結果ボックスのボーダーも強度に合わせて光らせる
    if(level > 0) {
        resultContainer.style.borderColor = colors[level];
        resultContainer.style.boxShadow = `0 0 15px ${colors[level].replace(')', ', 0.2)').replace('rgb', 'rgba')}`;
    } else {
        resultContainer.style.borderColor = 'var(--border-color)';
        resultContainer.style.boxShadow = 'none';
    }

    bars.forEach((bar, index) => {
        if (index < level) {
            bar.style.backgroundColor = colors[level];
            bar.style.boxShadow = `0 0 10px ${colors[level]}`;
        } else {
            bar.style.backgroundColor = colors[0];
            bar.style.boxShadow = 'none';
        }
    });
}

// トースト通知（コピー完了）
function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// 初期ロード時に1回実行しておく
generatePassword();
