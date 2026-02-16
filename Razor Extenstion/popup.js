// ---- SAFE CHROME STORAGE FALLBACK ----
const safeChrome = typeof chrome !== "undefined" && chrome.storage
  ? chrome
  : {
      storage: {
        local: {
          get: (_, cb) => cb && cb({}),
          set: (_, cb) => cb && cb(),
          remove: (_, cb) => cb && cb(),
        },
      },
      tabs: { query: async () => [] },
      scripting: { executeScript: async () => {} },
    };

// ---- FIELD MAPPINGS ----
const FIELDS = [
  { label: 'Condition', id: 'Condition', selector: '#ac_Condition' },
  { label: 'Location', id: 'Location', selector: '#ac_Location' },
  { label: 'Category', id: 'Category', selector: '#ac_Category' },
  { label: 'Notes', id: 'Notes', selector: 'textarea[name="Notes"]' },
  { label: 'Next Step', id: 'NextStep', selector: '#dd_AssetWorkflowSteps', isDropdown: true, options: [
    { label: 'Data Collection', value: '0' },
    { label: 'Data Destruction', value: '1' },
    { label: 'Resale', value: '102' },
    { label: 'Scrap', value: '103' }
  ]},
  { label: 'Packaging', id: 'PACKAGING', selector: '#ac_PACKAGING' },
  { label: 'Description', id: 'Description', selector: '#ac_Description' },
  { label: 'Weight', id: 'Weight', selector: 'input[name="Weight"]' },
  { label: 'Form Factor', id: 'FormFactor', selector: '#ac_HardDrive__FormFactor' },
  { label: 'CPU Type', id: 'CPUType', selector: '#ac_CPUType' },
  { label: 'CPU Speed', id: 'CPUSpeed', selector: '#ac_CPUSpeed' },
  { label: 'CPU Cores', id: 'CPUCores', selector: '#ac_CPUCores' },
  { label: 'Memory', id: 'Memory', selector: '#ac_Memory' },
  { label: 'Memory Speed', id: 'MemorySpeed', selector: '#ac_MemorySpeed' },
  { label: 'Memory Config', id: 'MemoryConfiguration', selector: '#ac_MemoryConfiguration' },
  { label: 'HDD Qty', id: 'HDDQty', selector: '#ac_HDDQty' },
  { label: 'HDD Model', id: 'HardDriveModel', selector: '#ac_HardDriveModel' },
  { label: 'HDD Serial', id: 'HardDriveSerial', selector: '#ac_HardDriveSerial' },
  { label: 'HDD Type', id: 'HDDType', selector: '#ac_HDDType' },
  { label: 'Storage Medium', id: 'StorageMedium', selector: '#ac_StorageMedium' },
  { label: 'HDD Size', id: 'HDDSize', selector: '#ac_HDDSize' },
  { label: 'HDD Caddie', id: 'HDDCaddie', selector: '#ac_HDDCaddie' },
  { label: 'HDD Removed', id: 'HDDRemoved', selector: '#ac_HDDRemoved' },
  { label: 'Erasure Method', id: 'ErasureMethod', selector: '#ac_ErasureMethod' },
  { label: 'Erasure Results', id: 'ErasureResults', selector: '#ac_ErasureResults' },
  { label: 'Erasure Date', id: 'ErasureDate', selector: '#ac_ErasureDate' },
  { label: 'Drive Shredded', id: 'DriveShredded', selector: '#ac_DriveShredded' },
  { label: 'Optical Drive', id: 'OpticalDrive', selector: '#ac_OpticalDrive' },
  { label: 'Fingerprint Sens', id: 'FingerprintSens', selector: '#ac_FingerprintSens' },
  { label: 'NIC', id: 'NIC', selector: '#ac_NIC' },
  { label: 'Video Adapter', id: 'VideoAdapter', selector: '#ac_VideoAdapter' },
  { label: 'Webcam', id: 'Webcam', selector: '#ac_Webcam' },
  { label: 'WiFi', id: 'WIFI', selector: '#ac_WIFI' },
  { label: 'Ext Ports', id: 'ExtPorts', selector: '#ac_ExtPorts' },
  { label: 'Battery Type', id: 'BatteryType', selector: '#ac_BatteryType' },
  { label: 'Battery Life', id: 'BatteryLife', selector: '#ac_BatteryLife' },
  { label: 'Screen Resolution', id: 'ScreenResolution', selector: '#ac_ScreenResolution' },
  { label: 'Screen Size', id: 'ScreenSize', selector: '#ac_ScreenSize' },
  { label: 'Touch Screen', id: 'TouchScreen', selector: '#ac_TouchScreen' },
  { label: 'COA', id: 'COA', selector: '#ac_COA' },
  { label: 'Pass or Fail', id: 'PassorFail', selector: '#ac_PassorFail' },
  { label: 'Grade', id: 'Grade', selector: '#ac_Grade' },
  { label: 'Fail Reason', id: 'FailReason', selector: '#ac_FailReason' },
  { label: 'Repaired', id: 'Repaired', selector: '#ac_Repaired' },
  { label: 'Final Grade', id: 'FinalGrade', selector: '#ac_FinalGrade' },
  { label: 'CPU Test Results', id: 'CPUTestResults', selector: '#ac_CPUTestResults' },
  { label: 'Memory Test Results', id: 'MemoryTestResults', selector: '#ac_MemoryTestResults' },
  { label: 'MB Test Results', id: 'MBTestResults', selector: '#ac_MBTestResults' },
  { label: 'LCD Test Results', id: 'LCDTestResults', selector: '#ac_LCDTestResults' },
  { label: 'KB Test Results', id: 'KBTestResults', selector: '#ac_KBTestResults' }
];

// ---- PRESETS ----
const PRESETS = {
  gradeD_noHDD: {
    Condition: "SCRAP",
    Notes: "MISSING HARD DRIVE",
    NextStep: "102", // Resale
    PACKAGING: "SINGLE",
    // Form Factor and WiFi will be determined by reading Category
    CPUType: "N/A",
    CPUSpeed: "N/A",
    CPUCores: "N/A",
    Memory: "N/A",
    MemorySpeed: "N/A",
    MemoryConfiguration: "N/A",
    HDDQty: "0",
    HardDriveModel: "N/A",
    HardDriveSerial: "N/A",
    HDDType: "N/A",
    StorageMedium: "N/A",
    HDDSize: "N/A",
    HDDCaddie: "N/A",
    HDDRemoved: "NO",
    ErasureMethod: "N/A",
    ErasureResults: "N/A",
    ErasureDate: "N/A",
    DriveShredded: "NO",
    OpticalDrive: "N/A",
    NIC: "N/A",
    VideoAdapter: "N/A",
    Webcam: "Camera",
    // WiFi determined by category
    PassorFail: "FAIL",
    Grade: "D",
    FailReason: "NO POWER",
    Repaired: "NO",
    FinalGrade: "D",
    CPUTestResults: "N/A",
    MemoryTestResults: "N/A",
    MBTestResults: "N/A",
    LCDTestResults: "N/A",
    KBTestResults: "N/A"
  },
  
  gradeF_noHDD: {
    Condition: "SCRAP",
    Notes: "MISSING HARD DRIVE",
    NextStep: "102", // Resale
    PACKAGING: "SINGLE",
    FormFactor: "LAPTOP", // Always Laptop for Grade F
    CPUType: "N/A",
    CPUSpeed: "N/A",
    CPUCores: "N/A",
    Memory: "N/A",
    MemorySpeed: "N/A",
    MemoryConfiguration: "N/A",
    HDDQty: "0",
    HardDriveModel: "N/A",
    HardDriveSerial: "N/A",
    HDDType: "N/A",
    StorageMedium: "N/A",
    HDDSize: "N/A",
    HDDCaddie: "N/A",
    HDDRemoved: "NO",
    ErasureMethod: "N/A",
    ErasureResults: "N/A",
    ErasureDate: "N/A",
    DriveShredded: "NO",
    OpticalDrive: "N/A",
    NIC: "N/A",
    VideoAdapter: "N/A",
    Webcam: "Camera",
    WIFI: "YES", // Always Yes for Laptop
    PassorFail: "FAIL",
    Grade: "F",
    FailReason: "CRACKED SCREEN",
    Repaired: "NO",
    FinalGrade: "F",
    CPUTestResults: "N/A",
    MemoryTestResults: "N/A",
    MBTestResults: "N/A",
    LCDTestResults: "N/A",
    KBTestResults: "N/A"
  },
  
  gradeD_yesHDD: {
    Condition: "SCRAP",
    NextStep: "102", // Resale
    PACKAGING: "SINGLE",
    // Form Factor and WiFi will be determined by reading Category
    CPUType: "N/A",
    CPUSpeed: "N/A",
    CPUCores: "N/A",
    Memory: "N/A",
    MemorySpeed: "N/A",
    MemoryConfiguration: "N/A",
    HDDRemoved: "YES",
    ErasureMethod: "N/A",
    ErasureResults: "N/A",
    ErasureDate: "N/A",
    OpticalDrive: "N/A",
    NIC: "N/A",
    VideoAdapter: "N/A",
    Webcam: "Camera",
    // WiFi determined by category
    PassorFail: "FAIL",
    Grade: "D",
    FailReason: "NO POWER",
    Repaired: "NO",
    FinalGrade: "D",
    CPUTestResults: "N/A",
    MemoryTestResults: "N/A",
    MBTestResults: "N/A",
    LCDTestResults: "N/A",
    KBTestResults: "N/A"
  },
  
  gradeF_yesHDD: {
    Condition: "SCRAP",
    NextStep: "102", // Resale
    PACKAGING: "SINGLE",
    FormFactor: "LAPTOP", // Always Laptop for Grade F
    CPUType: "N/A",
    CPUSpeed: "N/A",
    CPUCores: "N/A",
    Memory: "N/A",
    MemorySpeed: "N/A",
    MemoryConfiguration: "N/A",
    HDDRemoved: "YES",
    ErasureMethod: "N/A",
    ErasureResults: "N/A",
    ErasureDate: "N/A",
    OpticalDrive: "N/A",
    NIC: "N/A",
    VideoAdapter: "N/A",
    Webcam: "Camera",
    WIFI: "YES", // Always Yes for Laptop
    PassorFail: "FAIL",
    Grade: "F",
    FailReason: "CRACKED SCREEN",
    Repaired: "NO",
    FinalGrade: "F",
    CPUTestResults: "N/A",
    MemoryTestResults: "N/A",
    MBTestResults: "N/A",
    LCDTestResults: "N/A",
    KBTestResults: "N/A"
  }
};

// ---- INIT ----
document.addEventListener("DOMContentLoaded", init);

function init() {
  buildForm();
  loadSavedTemplate();
  setupEventListeners();
}

// ---- BUILD FORM ----
function buildForm() {
  const container = document.getElementById('form-fields');
  if (!container) return;
  container.innerHTML = "";
  FIELDS.forEach((field) => {
    // Skip Final Grade field in custom template (auto-filled from Grade)
    if (field.id === 'FinalGrade') {
      return;
    }
    
    const row = document.createElement("div");
    row.className = "form-row";
    
    if (field.isDropdown && field.options) {
      // Create dropdown select for dropdown fields
      const selectOptions = field.options.map(opt => {
        // Handle both string options and {label, value} objects
        if (typeof opt === 'string') {
          return `<option value="${opt}">${opt}</option>`;
        } else {
          return `<option value="${opt.value}">${opt.label}</option>`;
        }
      }).join('');
      row.innerHTML = `
        <label>${field.label}:</label>
        <select id="field_${field.id}">
          <option value="">-- Select --</option>
          ${selectOptions}
        </select>
      `;
    } else {
      // Create text input for regular fields
      row.innerHTML = `
        <label>${field.label}:</label>
        <input type="text" id="field_${field.id}" placeholder="">
      `;
    }
    container.appendChild(row);
  });
}

// ---- LOAD / SAVE ----
function loadSavedTemplate() {
  safeChrome.storage.local.get(['saved_template'], (result) => {
    if (result.saved_template) fillFormInputs(result.saved_template);
  });
}

function fillFormInputs(data) {
  Object.keys(data).forEach((key) => {
    // Skip Final Grade - it's auto-copied from Grade, no input field
    if (key === 'FinalGrade') {
      console.log("Skipping Final Grade in UI (will be auto-copied from Grade)");
      return;
    }
    const input = document.getElementById(`field_${key}`);
    if (input) input.value = data[key] || "";
  });
}

// ---- EVENT LISTENERS ----
function setupEventListeners() {
  console.log("Setting up event listeners");
  
  // Presets - pass isPreset=true
  const presetButtons = document.querySelectorAll("[data-preset]");
  console.log("Found preset buttons:", presetButtons.length);
  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Preset clicked:", btn.dataset.preset);
      const preset = PRESETS[btn.dataset.preset];
      fillAndSubmit(preset, true); // TRUE = this is a preset button
    });
  });

  // Save / Fill / Clear
  const actionButtons = document.querySelectorAll("[data-action]");
  console.log("Found action buttons:", actionButtons.length);
  actionButtons.forEach((btn) => {
    console.log("Registering button:", btn.dataset.action, btn.textContent);
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      console.log("Action button clicked:", action);
      if (action === "save") saveTemplate();
      else if (action === "fill") fillCustomTemplate(); // fillCustomTemplate calls with isPreset=false
      else if (action === "clear") clearTemplate();
    });
  });
}

// ---- ACTIONS ----
function saveTemplate() {
  const data = {};
  FIELDS.forEach((field) => {
    const input = document.getElementById(`field_${field.id}`);
    if (input && input.value.trim()) {
      data[field.id] = input.value.trim();
    }
  });
  
  // ALWAYS force Final Grade to match Grade (override any existing value)
  if (data.Grade) {
    data.FinalGrade = data.Grade;
  }
  
  if (Object.keys(data).length === 0) {
    showStatus("âš  No fields filled to save", true);
    return;
  }
  
  safeChrome.storage.local.set({ saved_template: data }, () => {
    if (chrome.runtime.lastError) {
      showStatus("Error saving: " + chrome.runtime.lastError.message, true);
    } else {
      showStatus("âœ“ Template saved!");
    }
  });
}

async function fillCustomTemplate() {
  const data = {};
  FIELDS.forEach((field) => {
    const input = document.getElementById(`field_${field.id}`);
    if (input && input.value.trim()) {
      data[field.id] = input.value.trim();
    }
  });
  
  // ALWAYS force Final Grade to match Grade (override any existing value)
  if (data.Grade) {
    data.FinalGrade = data.Grade;
  }
  
  if (Object.keys(data).length === 0) {
    showStatus("âš  No fields filled to submit", true);
    return;
  }
  
  await fillAndSubmit(data, false); // FALSE = this is custom template, no auto-detection
}

function clearTemplate() {
  FIELDS.forEach((field) => {
    const input = document.getElementById(`field_${field.id}`);
    if (input) input.value = "";
  });
  safeChrome.storage.local.remove(['saved_template']);
  showStatus("âœ“ Template cleared!");
}

// ---- PAGE INJECTION ----
async function fillAndSubmit(data, isPreset = false) {
  try {
    const [tab] = await safeChrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showStatus("âŒ No active tab found", true);
      return;
    }
    
    if (!tab.id) {
      showStatus("âŒ Invalid tab ID", true);
      return;
    }
    
    if (!safeChrome.scripting || !safeChrome.scripting.executeScript) {
      showStatus("âŒ Extension scripting API not available", true);
      return;
    }
    
    const results = await safeChrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (fieldMappings, formData, isPreset) => {
        // Read Grade from the page (it's already filled manually)
        const gradeElement = document.querySelector('#ac_Grade');
        const currentGrade = gradeElement ? gradeElement.value : null;
        
        let isLaptop = true; // Default to Laptop
        let deviceType = "UNKNOWN";
        
        // Only read Category and auto-set Form Factor/WiFi for PRESET buttons
        if (isPreset) {
          // Read Category field to determine Desktop or Laptop
          const categoryElement = document.querySelector('#ac_Category');
          const categoryValue = categoryElement ? categoryElement.value : '';
          
          // Determine if Desktop or Laptop
          if (categoryValue.includes('Desktops')) {
            isLaptop = false;
          }
          deviceType = isLaptop ? "LAPTOP" : "DESKTOP";
          
          // Auto-set Form Factor and WiFi if not already set (for Grade D presets)
          if (!formData.FormFactor) {
            formData.FormFactor = isLaptop ? "LAPTOP" : "DESKTOP";
          }
          if (!formData.WIFI) {
            formData.WIFI = isLaptop ? "YES" : "NO";
          }
        }
        
        // Copy Grade from page to Final Grade
        if (currentGrade) {
          formData.FinalGrade = currentGrade;
        }
        
        // Fields that don't exist on Desktop
        const desktopSkipFields = [
          'BatteryType', 'BatteryLife', 'ScreenResolution', 
          'ScreenSize', 'TouchScreen', 'FingerprintSens',
          'LCDTestResults', 'KBTestResults'
        ];
        
        let filledCount = 0;
        const results = [];
        
        fieldMappings.forEach((field) => {
          // Skip Desktop-only fields if this is a Desktop (only for presets)
          if (isPreset && !isLaptop && desktopSkipFields.includes(field.id)) {
            return;
          }
          
          // Only fill fields that have values in formData
          if (formData[field.id]) {
            const el = document.querySelector(field.selector);
            if (el) {
              // Set the value
              el.value = formData[field.id];
              
              // For dropdowns, also try to select by text if value doesn't work
              if (field.isDropdown && el.tagName === 'SELECT') {
                const options = Array.from(el.options);
                const matchingOption = options.find(opt => 
                  opt.value === formData[field.id] || 
                  opt.text === formData[field.id]
                );
                if (matchingOption) {
                  el.selectedIndex = matchingOption.index;
                }
              }
              
              // Trigger multiple events for autocomplete fields
              el.dispatchEvent(new Event("input", { bubbles: true }));
              el.dispatchEvent(new Event("change", { bubbles: true }));
              el.dispatchEvent(new Event("blur", { bubbles: true }));
              
              // For autocomplete fields, also trigger keyup and keydown
              if (el.classList.contains('ui-autocomplete-input')) {
                el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
                el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
              }
              
              filledCount++;
              results.push({ field: field.id, success: true, value: formData[field.id] });
            } else {
              results.push({ field: field.id, success: false, reason: 'not found' });
            }
          }
        });
        return { success: true, filledCount: filledCount, details: results, deviceType: isPreset ? deviceType : "CUSTOM" };
      },
      args: [FIELDS, data, isPreset],
    });
    
    if (results && results[0] && results[0].result) {
      const { filledCount, deviceType } = results[0].result;
      if (deviceType === "CUSTOM") {
        showStatus(`âœ“ Filled ${filledCount} field(s)!`);
      } else {
        showStatus(`âœ“ Filled ${filledCount} field(s) for ${deviceType}!`);
      }
    } else {
      showStatus("âœ“ Form filled successfully!");
    }
  } catch (err) {
    showStatus("Error: " + err.message, true);
  }
}

// ---- HELPERS ----
function showStatus(message, isError = false) {
  const status = document.getElementById("status");
  if (!status) return;
  status.textContent = message;
  status.style.background = isError ? "#ffebee" : "#e8f5e9";
  status.style.color = isError ? "#c62828" : "#2e7d32";
  status.classList.add("show");
  setTimeout(() => status.classList.remove("show"), 3000);
}