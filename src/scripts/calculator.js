class UltimateCalculator {
  constructor() {
    this.previousOperandElement = document.getElementById('previous-operand');
    this.currentOperandElement = document.getElementById('current-operand');
    this.display = document.getElementById('display');
    this.memoryIndicator = document.getElementById('memoryIndicator');
    
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.memory = 0;
    this.history = this.loadHistory();
    
    this.converterTypes = {
      length: {
        name: 'Length',
        units: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch'],
        toBase: {
          meter: 1,
          kilometer: 1000,
          centimeter: 0.01,
          millimeter: 0.001,
          mile: 1609.344,
          yard: 0.9144,
          foot: 0.3048,
          inch: 0.0254
        }
      },
      weight: {
        name: 'Weight',
        units: ['kilogram', 'gram', 'milligram', 'pound', 'ounce', 'ton'],
        toBase: {
          kilogram: 1,
          gram: 0.001,
          milligram: 0.000001,
          pound: 0.453592,
          ounce: 0.0283495,
          ton: 1000
        }
      },
      temperature: {
        name: 'Temperature',
        units: ['celsius', 'fahrenheit', 'kelvin'],
        convert: (val, from, to) => {
          let celsius;
          if (from === 'celsius') celsius = val;
          else if (from === 'fahrenheit') celsius = (val - 32) * 5/9;
          else celsius = val - 273.15;
          
          if (to === 'celsius') return celsius;
          if (to === 'fahrenheit') return celsius * 9/5 + 32;
          return celsius + 273.15;
        }
      },
      area: {
        name: 'Area',
        units: ['sqmeter', 'sqkilometer', 'sqfoot', 'sqinch', 'acre', 'hectare'],
        toBase: {
          sqmeter: 1,
          sqkilometer: 1000000,
          sqfoot: 0.092903,
          sqinch: 0.00064516,
          acre: 4046.86,
          hectare: 10000
        }
      }
    };
    
    this.settings = {
      beamEnabled: true,
      floatEnabled: true,
      soundEnabled: false,
      autoSaveEnabled: true,
      theme: 'dark'
    };
    
    this.currentConverterType = 'length';
    this.currentTool = 'tip';
    
    this.init();
    this.initEventListeners();
    this.renderHistory();
    this.initConverter();
    this.applySettings();
  }

  init() {
    document.querySelectorAll('.btn-num').forEach(btn => {
      btn.addEventListener('click', () => this.appendNumber(btn.dataset.number));
    });

    document.querySelectorAll('.btn').forEach(btn => {
      const action = btn.dataset.action;
      const memAction = btn.dataset.mem;
      const sciAction = btn.dataset.sci;
      
      if (action) {
        btn.addEventListener('click', () => {
          if (action === 'clear') this.clear();
          if (action === 'delete') this.delete();
          if (action === 'equals') this.compute();
          if (action === 'percent') this.percent();
          if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
            this.chooseOperation(action);
          }
        });
      }
      
      if (memAction) {
        btn.addEventListener('click', () => this.handleMemory(memAction));
      }
      
      if (sciAction) {
        btn.addEventListener('click', () => this.handleScientific(sciAction));
      }
    });

    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  initEventListeners() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const scientificRow = document.getElementById('scientificRow');
        if (btn.dataset.mode === 'scientific') {
          scientificRow.classList.add('show');
        } else {
          scientificRow.classList.remove('show');
        }
      });
    });

    document.querySelectorAll('.toggle-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const panels = ['historyPanel', 'converterPanel', 'toolsPanel', 'settingsPanel', 'countdownPanel'];
        const panel = document.getElementById(panels[index]);
        panel.classList.toggle('show');
      });
    });

    document.querySelectorAll('.panel-close').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.panel').classList.remove('show');
      });
    });

    document.querySelectorAll('.converter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.converter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentConverterType = btn.dataset.type;
        this.initConverter();
      });
    });

    document.getElementById('converterInput').addEventListener('input', () => this.convert());
    document.getElementById('fromUnit').addEventListener('change', () => this.convert());
    document.getElementById('toUnit').addEventListener('change', () => this.convert());

    document.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.tool-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        this.currentTool = card.dataset.tool;
        document.querySelectorAll('.tool-content').forEach(c => c.classList.remove('show'));
        document.querySelector(`.${this.currentTool}-tool`).classList.add('show');
      });
    });

    document.getElementById('calculateTip').addEventListener('click', () => this.calculateTip());
    document.getElementById('calculateLoan').addEventListener('click', () => this.calculateLoan());
    document.getElementById('calculateBMI').addEventListener('click', () => this.calculateBMI());
    document.getElementById('calculateDate').addEventListener('click', () => this.calculateDate());
    document.getElementById('calculateDiscount').addEventListener('click', () => this.calculateDiscount());
    document.getElementById('calculateAge').addEventListener('click', () => this.calculateAge());
    document.getElementById('calculateBase').addEventListener('click', () => this.calculateBaseConversion());
    document.getElementById('calculatePercentChange').addEventListener('click', () => this.calculatePercentChange());

    document.getElementById('settingBeam').addEventListener('click', (e) => {
      this.settings.beamEnabled = !this.settings.beamEnabled;
      e.target.classList.toggle('active');
      if (this.settings.beamEnabled) {
        this.startNarutoBeam();
      }
    });

    document.getElementById('settingFloat').addEventListener('click', (e) => {
      this.settings.floatEnabled = !this.settings.floatEnabled;
      e.target.classList.toggle('active');
      document.querySelector('.calculator').style.animation = this.settings.floatEnabled ? 'floatCalc 6s ease-in-out infinite' : 'none';
    });

    document.getElementById('settingSound').addEventListener('click', (e) => {
      this.settings.soundEnabled = !this.settings.soundEnabled;
      e.target.classList.toggle('active');
    });

    document.getElementById('settingAutoSave').addEventListener('click', (e) => {
      this.settings.autoSaveEnabled = !this.settings.autoSaveEnabled;
      e.target.classList.toggle('active');
    });

    document.getElementById('toggleCountdown').addEventListener('click', () => {
      document.getElementById('countdownPanel').classList.toggle('show');
    });

    document.getElementById('closeCountdown').addEventListener('click', () => {
      document.getElementById('countdownPanel').classList.remove('show');
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });

    // Copy to clipboard
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const resultElement = e.target.closest('.tool-result, .converter-result').querySelector('.tool-result-value, .converter-result-value');
        if (resultElement) {
          this.copyToClipboard(resultElement.textContent);
        }
      });
    });

    this.startCountdown();
  }

  initConverter() {
    const type = this.converterTypes[this.currentConverterType];
    const fromSelect = document.getElementById('fromUnit');
    const toSelect = document.getElementById('toUnit');
    
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    
    type.units.forEach(unit => {
      fromSelect.innerHTML += `<option value="${unit}">${this.formatUnitName(unit)}</option>`;
      toSelect.innerHTML += `<option value="${unit}">${this.formatUnitName(unit)}</option>`;
    });
    
    if (type.units.length > 1) {
      toSelect.selectedIndex = 1;
    }
    
    this.convert();
  }

  formatUnitName(unit) {
    const names = {
      meter: 'Meter (m)',
      kilometer: 'Kilometer (km)',
      centimeter: 'Centimeter (cm)',
      millimeter: 'Millimeter (mm)',
      mile: 'Mile (mi)',
      yard: 'Yard (yd)',
      foot: 'Foot (ft)',
      inch: 'Inch (in)',
      kilogram: 'Kilogram (kg)',
      gram: 'Gram (g)',
      milligram: 'Milligram (mg)',
      pound: 'Pound (lb)',
      ounce: 'Ounce (oz)',
      ton: 'Ton (t)',
      celsius: 'Celsius (°C)',
      fahrenheit: 'Fahrenheit (°F)',
      kelvin: 'Kelvin (K)',
      sqmeter: 'Square Meter (m²)',
      sqkilometer: 'Square Kilometer (km²)',
      sqfoot: 'Square Foot (ft²)',
      sqinch: 'Square Inch (in²)',
      acre: 'Acre',
      hectare: 'Hectare (ha)'
    };
    return names[unit] || unit;
  }

  convert() {
    const input = parseFloat(document.getElementById('converterInput').value);
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;
    
    if (isNaN(input)) {
      document.getElementById('converterResult').textContent = '0';
      return;
    }
    
    const type = this.converterTypes[this.currentConverterType];
    let result;
    
    if (this.currentConverterType === 'temperature') {
      result = type.convert(input, fromUnit, toUnit);
    } else {
      const baseValue = input * type.toBase[fromUnit];
      result = baseValue / type.toBase[toUnit];
    }
    
    document.getElementById('converterResult').textContent = result.toLocaleString('en-US', { maximumFractionDigits: 6 });
    document.getElementById('converterResultUnit').textContent = this.formatUnitName(toUnit);
  }

  calculateTip() {
    const amount = parseFloat(document.getElementById('tipAmount').value) || 0;
    const percent = parseFloat(document.getElementById('tipPercent').value) || 15;
    const split = parseFloat(document.getElementById('tipSplit').value) || 1;
    
    const tip = (amount * percent / 100) / split;
    document.getElementById('tipResult').textContent = '$' + tip.toFixed(2);
  }

  calculateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const rate = parseFloat(document.getElementById('loanRate').value) || 0;
    const term = parseFloat(document.getElementById('loanTerm').value) || 1;
    
    if (rate === 0) {
      document.getElementById('loanResult').textContent = '$' + (amount / term).toFixed(2);
      return;
    }
    
    const monthlyRate = rate / 100 / 12;
    const payment = amount * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1);
    
    document.getElementById('loanResult').textContent = '$' + payment.toFixed(2);
  }

  calculateBMI() {
    const weight = parseFloat(document.getElementById('bmiWeight').value) || 0;
    const height = parseFloat(document.getElementById('bmiHeight').value) || 0;
    
    if (weight === 0 || height === 0) {
      document.getElementById('bmiResult').textContent = '0.0';
      return;
    }
    
    const heightMeters = height / 100;
    const bmi = weight / (heightMeters * heightMeters);
    
    document.getElementById('bmiResult').textContent = bmi.toFixed(1);
    
    let label;
    if (bmi < 18.5) label = 'Underweight';
    else if (bmi < 25) label = 'Normal';
    else if (bmi < 30) label = 'Overweight';
    else label = 'Obese';
    
    document.getElementById('bmiLabel').textContent = label;
  }

  calculateDate() {
    const from = new Date(document.getElementById('dateFrom').value);
    const to = new Date(document.getElementById('dateTo').value);
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      document.getElementById('dateResult').textContent = '0';
      return;
    }
    
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    document.getElementById('dateResult').textContent = diffDays;
  }

  calculateDiscount() {
    const originalPrice = parseFloat(document.getElementById('discountOriginalPrice').value) || 0;
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    
    const discountAmount = originalPrice * (discountPercent / 100);
    const finalPrice = originalPrice - discountAmount;
    
    document.getElementById('discountResult').textContent = '$' + finalPrice.toFixed(2);
    document.getElementById('discountSavedResult').textContent = '$' + discountAmount.toFixed(2);
  }

  calculateAge() {
    const birthDate = new Date(document.getElementById('ageBirthDate').value);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      document.getElementById('ageResult').textContent = 'Invalid date';
      return;
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const months = Math.abs(today.getMonth() - birthDate.getMonth());
    const days = Math.abs(today.getDate() - birthDate.getDate());
    
    document.getElementById('ageResult').textContent = `${age} years, ${months} months, ${days} days`;
  }

  calculateBaseConversion() {
    const number = document.getElementById('baseNumber').value;
    const fromBase = parseInt(document.getElementById('fromBase').value);
    
    if (!number) {
      document.getElementById('baseResult').textContent = 'Enter a number';
      return;
    }
    
    try {
      const decimal = parseInt(number, fromBase);
      
      if (isNaN(decimal)) {
        document.getElementById('baseResult').textContent = 'Invalid number';
        return;
      }
      
      const binary = decimal.toString(2);
      const octal = decimal.toString(8);
      const hex = decimal.toString(16).toUpperCase();
      const decimalStr = decimal.toString();
      
      document.getElementById('baseResult').innerHTML = `
        <div>Binary: ${binary}</div>
        <div>Octal: ${octal}</div>
        <div>Decimal: ${decimalStr}</div>
        <div>Hexadecimal: ${hex}</div>
      `;
    } catch (e) {
      document.getElementById('baseResult').textContent = 'Invalid number';
    }
  }

  calculatePercentChange() {
    const original = parseFloat(document.getElementById('percentOriginal').value) || 0;
    const current = parseFloat(document.getElementById('percentCurrent').value) || 0;
    
    if (original === 0) {
      document.getElementById('percentChangeResult').textContent = 'Cannot divide by zero';
      return;
    }
    
    const change = ((current - original) / original) * 100;
    const direction = change >= 0 ? 'increase' : 'decrease';
    
    document.getElementById('percentChangeResult').innerHTML = `
      <div>${Math.abs(change).toFixed(2)}% ${direction}</div>
      <div style="color: ${change >= 0 ? 'var(--tertiary)' : 'var(--orange)'}">
        ${current.toLocaleString()} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)
      </div>
    `;
  }

  toggleTheme() {
    this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light-theme', this.settings.theme === 'light');
    document.getElementById('themeToggle').textContent = this.settings.theme === 'dark' ? '🌙' : '☀️';
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showCopyNotification();
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showCopyNotification();
    });
  }

  showCopyNotification() {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = 'Copied to clipboard!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  handleMemory(action) {
    const currentValue = parseFloat(this.currentOperand) || 0;
    
    switch (action) {
      case 'MC':
        this.memory = 0;
        break;
      case 'MR':
        this.currentOperand = this.memory.toString();
        break;
      case 'M+':
        this.memory += currentValue;
        break;
      case 'M-':
        this.memory -= currentValue;
        break;
    }
    
    this.updateMemoryIndicator();
    this.updateDisplay();
  }

  updateMemoryIndicator() {
    if (this.memory !== 0) {
      this.memoryIndicator.classList.add('show');
    } else {
      this.memoryIndicator.classList.remove('show');
    }
  }

  handleScientific(action) {
    const currentValue = parseFloat(this.currentOperand);
    
    if (isNaN(currentValue)) return;
    
    switch (action) {
      case 'sin':
        this.currentOperand = Math.sin(currentValue * Math.PI / 180).toString();
        break;
      case 'cos':
        this.currentOperand = Math.cos(currentValue * Math.PI / 180).toString();
        break;
      case 'tan':
        this.currentOperand = Math.tan(currentValue * Math.PI / 180).toString();
        break;
      case 'log':
        this.currentOperand = Math.log10(currentValue).toString();
        break;
      case 'sqrt':
        this.currentOperand = Math.sqrt(currentValue).toString();
        break;
      case 'pow':
        this.currentOperand = Math.pow(currentValue, 2).toString();
        break;
      case 'pi':
        this.currentOperand = Math.PI.toString();
        break;
      case 'e':
        this.currentOperand = Math.E.toString();
        break;
    }
    
    this.updateDisplay(true);
  }

  startNarutoBeam() {
    if (!this.settings.beamEnabled) return;
    
    const beam = document.getElementById('narutoBeam');
    const flash = document.getElementById('flash');
    
    const throwBeam = () => {
      if (!this.settings.beamEnabled) return;
      
      beam.classList.remove('throw', 'spiral');
      flash.classList.remove('flash-effect');
      
      void beam.offsetWidth;
      
      beam.classList.add('spiral');
      flash.classList.add('flash-effect');
      
      setTimeout(() => {
        beam.classList.remove('spiral');
        beam.classList.add('throw');
      }, 100);
      
      setTimeout(() => {
        beam.classList.remove('throw');
      }, 2500);
    };
    
    throwBeam();
    setInterval(() => {
      if (this.settings.beamEnabled) throwBeam();
    }, 7000);
  }

  applySettings() {
    document.querySelector('.calculator').style.animation = this.settings.floatEnabled ? 'floatCalc 6s ease-in-out infinite' : 'none';
    
    if (this.settings.beamEnabled) {
      this.startNarutoBeam();
    }
    
    // Apply theme
    if (this.settings.theme === 'light') {
      document.body.classList.add('light-theme');
      document.getElementById('themeToggle').textContent = '☀️';
    }
  }

  startCountdown() {
    const targetDate = new Date('March 16, 2026 00:00:00').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        document.getElementById('milliseconds').textContent = '000 ms';
        document.getElementById('countdownMessage').classList.add('show');
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const ms = Math.floor((distance % 1000));
      
      document.getElementById('days').textContent = days.toString().padStart(2, '0');
      document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
      document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
      document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
      document.getElementById('milliseconds').textContent = ms.toString().padStart(3, '0') + ' ms';
      
      document.getElementById('countdownMessage').classList.remove('show');
    };
    
    updateCountdown();
    setInterval(updateCountdown, 10);
  }

  handleKeyboard(e) {
    if (e.key >= '0' && e.key <= '9') this.appendNumber(e.key);
    if (e.key === '.') this.appendNumber('.');
    if (e.key === 'Enter' || e.key === '=') this.compute();
    if (e.key === 'Backspace') this.delete();
    if (e.key === 'Escape') this.clear();
    if (e.key === '+') this.chooseOperation('add');
    if (e.key === '-') this.chooseOperation('subtract');
    if (e.key === '*') this.chooseOperation('multiply');
    if (e.key === '/') this.chooseOperation('divide');
    if (e.key === '%') this.percent();
  }

  appendNumber(number) {
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
    } else {
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
    this.updateDisplay(true);
  }

  chooseOperation(operation) {
    if (this.currentOperand === '') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
    this.updateDisplay();
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case 'add': computation = prev + current; break;
      case 'subtract': computation = prev - current; break;
      case 'multiply': computation = prev * current; break;
      case 'divide':
        if (current === 0) {
          this.currentOperand = 'Error';
          this.updateDisplay();
          return;
        }
        computation = prev / current;
        break;
      default: return;
    }

    this.addToHistory(`${this.previousOperand} ${this.getOperationSymbol(this.operation)} ${this.currentOperand} = ${computation}`);
    
    this.currentOperand = computation;
    this.operation = undefined;
    this.previousOperand = '';
    this.updateDisplay(true);
  }

  percent() {
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;
    this.currentOperand = (current / 100).toString();
    this.updateDisplay(true);
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.updateDisplay();
  }

  delete() {
    if (this.currentOperand.length === 1 || this.currentOperand === 'Error') {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }
    this.updateDisplay(true);
  }

  updateDisplay(animate = false) {
    if (animate) {
      this.display.classList.add('fade');
      setTimeout(() => this.display.classList.remove('fade'), 200);
    }

    this.currentOperandElement.textContent = this.formatNumber(this.currentOperand);
    this.previousOperandElement.textContent = this.previousOperand 
      ? `${this.formatNumber(this.previousOperand)} ${this.getOperationSymbol(this.operation)}` 
      : '';
  }

  formatNumber(num) {
    if (num === 'Error') return 'Error';
    const number = parseFloat(num);
    if (isNaN(number)) return num;
    if (Math.abs(number) > 1e12 || (Math.abs(number) < 1e-6 && number !== 0)) {
      return number.toExponential(6);
    }
    return number.toLocaleString('en-US', { maximumFractionDigits: 10 });
  }

  getOperationSymbol(op) {
    const symbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
    return symbols[op] || '';
  }

  addToHistory(expression) {
    this.history.unshift(expression);
    if (this.history.length > 50) this.history.pop();
    
    this.renderHistory();
    
    if (this.settings.autoSaveEnabled) {
      this.saveHistory();
    }
  }

  renderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (this.history.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
      return;
    }
    
    historyList.innerHTML = this.history.map((item, index) => {
      const parts = item.split(' = ');
      return `
        <div class="history-item" data-index="${index}">
          <div class="history-expression">${parts[0]}</div>
          <div class="history-result">= ${parts[1]}</div>
        </div>
      `;
    }).join('');
    
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const result = this.history[item.dataset.index].split(' = ')[1];
        this.currentOperand = result;
        this.updateDisplay(true);
      });
    });
  }

  saveHistory() {
    try {
      localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    } catch (e) {
      console.warn('Could not save history to localStorage');
    }
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('calculatorHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new UltimateCalculator();
});
