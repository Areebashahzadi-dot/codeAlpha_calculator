const expressionEl=document.getElementById("expression");
const resultEl=document.getElementById("result");
const hintEl=document.getElementById("hint");
const keypad=document.getElementById("keypad");
let expression="",justCalculated=false;
const operators=["+","−","×","÷"];
function prettyNumber(n){if(!Number.isFinite(n))return "Error";if(Object.is(n,-0))n=0;return String(Number.parseFloat(n.toPrecision(12)));}

// Safe recursive-descent parser; it deliberately avoids eval().
function calculate(input){
 const normalized=input.replace(/−/g,"-").replace(/×/g,"*").replace(/÷/g,"/").replace(/\s/g,"");
 const tokens=normalized.match(/(?:\d+\.?\d*|\.\d+)|[+\-*/()%]/g);
 if(!tokens||tokens.join("")!==normalized)throw Error("Invalid expression");
 let p=0;
 function primary(){
  if(tokens[p]==="("){p++;const v=addSub();if(tokens[p]!==")")throw Error("Missing bracket");p++;return v;}
  if(tokens[p]==="+"||tokens[p]==="-"){const sign=tokens[p++]==="-"?-1:1;return sign*primary();}
  const t=tokens[p++];if(t===undefined||!/^(?:\d+\.?\d*|\.\d+)$/.test(t))throw Error("Expected number");return Number(t);
 }
 function mulDiv(){let v=primary();while(["*","/","%"].includes(tokens[p])){const op=tokens[p++],n=primary();if((op==="/"||op==="%")&&n===0)throw Error("Cannot divide by zero");v=op==="*"?v*n:op==="/"?v/n:v%n;}return v;}
 function addSub(){let v=mulDiv();while(tokens[p]==="+"||tokens[p]==="-"){const op=tokens[p++],n=mulDiv();v=op==="+"?v+n:v-n;}return v;}
 const answer=addSub();if(p!==tokens.length||!Number.isFinite(answer))throw Error("Invalid expression");return answer;
}
function updateDisplay(){
 expressionEl.textContent=expression||"0";
 if(!expression){resultEl.textContent="0";hintEl.textContent="Ready when you are";return;}
 try{resultEl.textContent=prettyNumber(calculate(expression));hintEl.textContent="Live answer ✨";}
 catch(e){resultEl.textContent="—";hintEl.textContent=e.message==="Cannot divide by zero"?"Cannot divide by zero":"Keep going…";}
}
function appendValue(value){
 if(justCalculated&&/[0-9.]/.test(value))expression="";
 justCalculated=false;const last=expression.slice(-1);
 if(operators.includes(value)){if(!expression&&value!=="−")return;if(operators.includes(last))expression=expression.slice(0,-1);}
 if(value==="."){const current=expression.split(/[+−×÷]/).pop();if(current.includes("."))return;if(!current)value="0.";}
 expression+=value;updateDisplay();
}
function clearAll(){expression="";justCalculated=false;updateDisplay();}
function deleteLast(){expression=expression.slice(0,-1);justCalculated=false;updateDisplay();}
function applyPercent(){const m=expression.match(/(\d+\.?\d*|\.\d+)$/);if(!m)return;expression=expression.slice(0,m.index)+prettyNumber(Number(m[0])/100);updateDisplay();}
function showAnswer(){if(!expression)return;try{expression=prettyNumber(calculate(expression));resultEl.textContent=expression;expressionEl.textContent=expression;hintEl.textContent="All figured out ♡";justCalculated=true;}catch(e){hintEl.textContent=e.message==="Cannot divide by zero"?"Cannot divide by zero":"Check your calculation";}}
keypad.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const {action,value}=b.dataset;if(action==="clear")clearAll();else if(action==="delete")deleteLast();else if(action==="percent")applyPercent();else if(action==="equals")showAnswer();else if(value)appendValue(value);});
document.addEventListener("keydown",e=>{
 if(/^\d$/.test(e.key))appendValue(e.key);else if(e.key===".")appendValue(".");
 else if(e.key==="+")appendValue("+");else if(e.key==="-")appendValue("−");else if(e.key==="*")appendValue("×");
 else if(e.key==="/"){e.preventDefault();appendValue("÷");}else if(e.key==="%")applyPercent();
 else if(e.key==="Enter"||e.key==="="){e.preventDefault();showAnswer();}
 else if(e.key==="Backspace")deleteLast();else if(e.key==="Escape")clearAll();
});
updateDisplay();