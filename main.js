'use strict';
const queue = [];
const stack = [];
let tmp = 0;
let nline = 0;
let ncol = 0;
let blocks;

let running = false;
let step = false;
let set = false;
let work = 0;

let input;
let inputGen;
const output = document.getElementById('output');
const dumps = document.getElementById('dumps');

function parse_block(block) {
    const fdata = {
        "정신나갈것같애": [push(tmp)],
        "정신나갈거같애": [read(tmp)],
        "정신나가서먹을것같애": [pop()],
        "정신나가서먹을거같애": [write(tmp)],
        "점심나갈것같애": [enqueue(tmp)],
        "점심나갈거같애": [tmp_dec()],
        "점심나가서먹을것같애": [dequeue()],
        "점심나가서먹을거같애": [tmp_inc()],
    };
    for (const [k, v] of Object.entries(fdata)) {
        fdata[k.replace("애", "아")] = [...v, move_line()];
    }
    for (const [k, v] of Object.entries(fdata)) {
        fdata[k + '.'] = [...v, tmp_reset()];
        if (k.indexOf("정신") !== -1) {
            fdata[k + '?'] = [...v, stack_cmp()];
        }
        else if (k.indexOf("점심") !== -1) {
            fdata[k + '?'] = [...v, queue_cmp()];
        }
    }

    return fdata[block];
}

function get_input() {
    input = document.getElementById('input').value;
}

function* read_one() {
    for (let i = 0; i < input.length; i++) {
        yield input[i];
    }
}

function show_output(obj){
	output.value += obj;
}

const next_line = () => () => {
    nline += 1;
    ncol = -1;
};

const move_line = () => () => {
    nline += stack.pop();
    ncol = -1;
};

const enqueue = (x) => () => { queue.unshift(x); };
const dequeue = () => () => { tmp = queue.pop(); };
const push = (x) => () => { stack.push(x); };
const pop = () => () => { tmp = stack.pop(); };

const queue_cmp = () => () => { enqueue(+(queue[-1] == tmp))(); };
const stack_cmp = () => () => { push(+(stack[-1] == tmp))(); };

const tmp_dec = () => () => { tmp -= 1; };
const tmp_inc = () => () => { tmp += 1; };
const tmp_reset = () => () => { tmp = 0; };

const read = () => () => { 
    let inputChar = inputGen.next().value;
    if (inputChar) {
        tmp =inputChar.charCodeAt(); 
    } else {
        alert("입력이부족해정신나갈것같애");
        tmp = -1;
        running = false;
    }};
const write = (x) => () => { show_output(String.fromCharCode(tmp)); }

function interpret() {
    if (nline > blocks.length) {
        if (!running) {
            clearTimeout(work);
            return;
        }
        if (work) {
            clearTimeout(work);
        }
    }
    one_block();
    // while (nline < blocks.length) {
    //     setTimeout( () => {
            
    //     }, 0);
    // };
    if (nline < blocks.length && running) {
        work = setTimeout(() => interpret(blocks), 0);
    }
}

function one_block() {
    let fs = parse_block(blocks[nline][ncol]);
    // console.log(fs);
    if (blocks[nline].length - 1 === ncol && fs.toString().indexOf(move_line()) === -1) {
        fs.push(next_line());
    }
    // setTimeout('write_dbg_msg("l " + nline + " " + ncol)', 0);
    let len = fs.length;
    let i = 0;
    while (i < len) {
        fs[i++]();
    }
    // setTimeout('write_dbg_msg("v " + tmp + " " + stack + " " + queue)',0);
    write_dbg_msg();
    // console.log("v " + tmp + " " + stack + " " + queue);
    ncol += 1;
    // if (!running) {
    //     break;
    // }
}

function init() {
    const code = document.getElementById('code').value;
    const codes = code.split("\n");
    const copyLines = [...codes];
    blocks = copyLines
        .map(x => x
            .replace(/같아/gi, '같아 ')
            .replace(/같애/gi, '같애 ')
            .replace(/ \./gi, '. ')
            .replace(/ \?/, '? ')
            .trim()
            .split(" "));
    get_input();
    inputGen = read_one();
    set = true;

    // return blocks;
}

function reset() {
    queue.length = 0;
    stack.length = 0;
    tmp = 0;
    nline = 0;
    ncol = 0;
    blocks.length = 0;
    output.value = "";
    dumps.value = "";
    set = false;
}

function run() {
    if (!set) {
        // blocks = init();
        init();
    }
    running = true;
    interpret();
    // console.log(blocks)
    
}

function stop() {
    running = false;
}

function one_step() {
    if (!set) {
        // blocks = init();
        init();
    }
    running = false;
    interpret();
}

function delete_msg() {
    output.value = "";
}

function write_dbg_msg() {
    // dumps.appendChild(document.createTextNode(msg.toString()))
    dumps.value = "(" + nline + ", " + ncol + ")\n" + "tmp " + tmp + "\nstack [" + stack + "]\nqueue [" + queue + "]"
}