const MISSING = 0
const ICORRECTLY_PLACED = 1
const CORRECTLY_PLACED = 2
const STATUSES = ['missing', 'icorrectly_placed', 'correctly_placed'];

// Create a new word row
function createWordRow(word) {
    const row = document.createElement('div');
    row.className = 'word-row';
    
    // Create letter boxes
    for (let i = 0; i < 5; i++) {
        const box = document.createElement('div');
        box.className = 'letter-box missing'; // Start with missing
        box.textContent = word[i];
        box.dataset.statusIndex = MISSING;
        
        box.addEventListener('click', () => {
            cycleStatus(box);
        });
        
        row.appendChild(box);
    }
    
    // Add word label
    const label = document.createElement('div');
    label.className = 'word-label';
    label.textContent = word;
    row.appendChild(label);
    
    return row;
}

function cycleStatus(box) {
    box.dataset.statusIndex = (box.dataset.statusIndex + 1) % STATUSES.length;
    
    box.classList.remove('missing', 'correctly_placed', 'icorrectly_placed');
    box.classList.add(STATUSES[box.dataset.statusIndex]);
}

const UNKNOWN = 32;
const RUS_ABC = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯU"

function set_bit(num, bit) {
    return num | 1<<bit;
}

function generateInfo() {
    const wordRows = wordsContainer.querySelectorAll('.word-row');
   
    var result = { missing: 0, icorrectMask: [0, 0, 0, 0, 0], correctMask: [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN]  };

    wordRows.forEach(row => {
        const boxes = row.querySelectorAll('.letter-box');

        for (var i = 0; i < boxes.length; i++) {
            const letterIndex = RUS_ABC.indexOf(boxes[i].textContent)
            const statusIndex = +(boxes[i].dataset.statusIndex) 

            switch (statusIndex) {
                case MISSING:
                    result.missing = set_bit(result.missing, letterIndex);
                    break;
                case CORRECTLY_PLACED:
                    result.correctMask[i] = letterIndex;
                    break;
                case ICORRECTLY_PLACED:
                    result.icorrectMask[i] = set_bit(result.icorrectMask[i], letterIndex);
            }
        }
    });
    
    return result;
}

function getUint8CArray(instance, jsArray, offset) {
    const cArray = new Uint8Array(
        instance.exports.memory.buffer,
        offset,
        jsArray.length
    );
    // Copy the values from JS to C.
    cArray.set(jsArray);

    return cArray
}

function getUint32CArray(instance, jsArray, offset) {
    const cArray = new Uint32Array(
        instance.exports.memory.buffer,
        offset,
        jsArray.length
    );
    // Copy the values from JS to C.
    cArray.set(jsArray);

    return cArray
}
 
async function getWasmModule() {
    if (window.wasmModuleInstance !== undefined)
        return window.wasmModuleInstance;

    const response = await fetch('/compiled.wasm');
    const arrayBuffer = await response.arrayBuffer();

    var result = await WebAssembly.instantiate(arrayBuffer)

    window.wasmModuleInstance = result.instance
    return window.wasmModuleInstance
}

function onInit () {
    const initialWords = ['МЕТОД', 'СПЛИН', 'КУРВА'];
    var wordsContainer = document.querySelector('.words-container')

    initialWords.forEach(word => {
        row = createWordRow(word)
        wordsContainer.appendChild(row)
    })
}

// Button event listeners
async function onGetNewWord () {
    const info = generateInfo();
    console.log(info);

    wasmModuleInstance = await getWasmModule()

    const icorrectMaskCArray = getUint32CArray(wasmModuleInstance, info.icorrectMask, 0);
    const correctMaskCArray = getUint8CArray(wasmModuleInstance, info.correctMask, icorrectMaskCArray.length * Uint32Array.BYTES_PER_ELEMENT);

    wasmModuleInstance.exports.calculate_word(info.missing, correctMaskCArray.byteOffset, icorrectMaskCArray.byteOffset)

    let answer = getUint8CArray(wasmModuleInstance, [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN], 0) 

    wasmModuleInstance.exports.get_word(answer.byteOffset)
    
    console.log(answer)

    let word = ""

    answer.forEach(num => {
        word += RUS_ABC[num]
    })
    
    console.log(word)
    
    var wordsContainer = document.querySelector('.words-container')

    row = createWordRow(word)

    wordsContainer.appendChild(row)
};

document.addEventListener('DOMContentLoaded', onInit())
