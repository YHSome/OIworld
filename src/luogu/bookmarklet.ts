/**
 * 「书签提交」：不装任何扩展也能把代码交到洛谷。
 *
 * 思路：把一段 JS 做成浏览器书签（书签的地址就是一段 javascript: 代码）。
 * 你在洛谷的题目页点一下这个书签，这段代码就在**洛谷自己的页面里**运行 ——
 * 于是它和洛谷页面同源，可以用浏览器自己的登录 Cookie 去调洛谷的提交接口，
 * 不涉及跨域，也不需要网页 JS 去伪造 Cookie 头。
 *
 * 代码从哪里来：本站题目页点「书签提交」时会
 *   1. 把 {code, lang, enableO2} 编码后放进剪贴板；
 *   2. 打开 https://www.luogu.com.cn/problem/{pid}?oiworld=<同一份编码>（太长时只带语言参数）。
 * 书签脚本优先读地址栏里的参数，读不到就读剪贴板，再读不到就弹输入框让你粘贴。
 *
 * 安全边界：脚本只在 luogu.com.cn 的题目页里跑，只读取洛谷页面上的 csrf-token 与
 * 你自己的登录 Cookie（由浏览器自动携带），不会把代码发往任何第三方。
 */

/** 书签里运行的那段代码。注意：内部不要出现反引号与 `${`，这里是最外层模板字符串。 */
const BOOKMARKLET_CODE = `(function(){
'use strict';
var pidMatch=/\\/problem\\/([A-Za-z0-9_-]{2,20})/.exec(location.pathname);
var box=null;
var STATUS={'-1':'未显示',0:'等待评测',1:'正在评测',2:'编译错误 CE',3:'输出超限 OLE',4:'内存超限 MLE',5:'运行超时 TLE',6:'答案错误 WA',7:'运行时错误 RE',11:'未知错误 UKE',12:'通过 AC',14:'未拿到满分 NAC',21:'Hack 成功',22:'Hack 失败',23:'Hack 跳过'};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function say(html,tone){
  if(!box){
    box=document.createElement('div');
    box.setAttribute('data-oiworld-bookmarklet','1');
    box.style.cssText='position:fixed;z-index:2147483647;right:16px;top:16px;max-width:430px;padding:12px 14px;border-radius:10px;background:#001529;color:#fff;font:13px/1.75 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);white-space:pre-wrap;word-break:break-word';
    document.body.appendChild(box);
  }
  box.style.borderLeft='5px solid '+(tone||'#1677ff');
  box.innerHTML=html;
}
if(!pidMatch){say('<b>OIworld 提交</b><br>请先在洛谷打开一道题目的页面（地址形如 /problem/P1001），再点这个书签。','#faad14');return;}
var pid=pidMatch[1];
var params=new URLSearchParams(location.search);
var fallbackLang=Number(params.get('oiworld-lang'))||27;
var fallbackO2=params.get('oiworld-o2')==='1'?1:0;
function decode(text){
  var b64=String(text).trim().replace(/-/g,'+').replace(/_/g,'/');
  while(b64.length%4){b64+='=';}
  var bin=atob(b64),bytes=new Uint8Array(bin.length),i;
  for(i=0;i<bin.length;i++){bytes[i]=bin.charCodeAt(i);}
  var parsed=JSON.parse(new TextDecoder().decode(bytes));
  if(!parsed||typeof parsed.code!=='string'||!parsed.code.trim()){throw new Error('empty');}
  return {code:parsed.code,lang:Number(parsed.lang)||fallbackLang,enableO2:parsed.enableO2?1:0};
}
function resolve(){
  var fromUrl=params.get('oiworld');
  if(fromUrl){try{return Promise.resolve(decode(fromUrl));}catch(e){}}
  var clip=navigator.clipboard&&navigator.clipboard.readText?navigator.clipboard.readText():Promise.reject();
  return clip.then(function(text){
    try{return decode(text);}catch(e){}
    if(text&&text.trim()){return {code:text,lang:fallbackLang,enableO2:fallbackO2};}
    throw new Error('empty');
  }).catch(function(){
    var typed=window.prompt('没读到代码：把 OIworld 里复制的代码粘贴到这里（或改用 OIworld 的桥接脚本自动提交）');
    if(!typed||!typed.trim())throw new Error('cancel');
    return {code:typed,lang:fallbackLang,enableO2:fallbackO2};
  });
}
function verdict(status){
  var label=STATUS[status]||('状态 '+status);
  var tone=status===12?'#52c41a':(status===0||status===1?'#1677ff':(status===2?'#faad14':'#ff4d4f'));
  return {label:label,tone:tone};
}
function poll(rid,tries){
  fetch('/record/'+rid+'?_contentOnly=1',{credentials:'same-origin',headers:{'x-luogu-type':'content-only'}})
    .then(function(r){return r.json();})
    .then(function(json){
      var data=json||{};
      var rec=(data.currentData&&data.currentData.record)||(data.data&&data.data.record)||data.record;
      var status=rec&&typeof rec.status==='number'?rec.status:-1;
      if(status===0||status===1){
        say('<b>已提交 R'+rid+'</b><br>洛谷正在评测…（'+(tries+1)+'）','#1677ff');
        if(tries<40){setTimeout(function(){poll(rid,tries+1);},2500);}else{say('<b>R'+rid+'</b><br>评测还在排队，去洛谷看结果吧。','#1677ff');}
        return;
      }
      var v=verdict(status);
      var cost=[];
      if(rec&&rec.time){cost.push(rec.time+' ms');}
      if(rec&&rec.memory){cost.push((rec.memory/1024).toFixed(2)+' MB');}
      say('<b>洛谷评测结果：'+esc(v.label)+'</b><br>R'+rid+(cost.length?' · '+cost.join(' / '):'')+(rec&&typeof rec.score==='number'?' · '+rec.score+' 分':'')+'<br><a href="https://www.luogu.com.cn/record/'+rid+'" target="_blank" style="color:#69b1ff">查看洛谷记录</a>',v.tone);
    })
    .catch(function(){
      if(tries<40){setTimeout(function(){poll(rid,tries+1);},2500);return;}
      say('<b>已提交 R'+rid+'</b><br>读取评测结果失败，去洛谷看吧。','#faad14');
    });
}
say('<b>OIworld 提交</b><br>正在准备提交到 '+pid+' …','#1677ff');
resolve().then(function(payload){
  var meta=document.querySelector('meta[name="csrf-token"]');
  var token=meta?meta.getAttribute('content'):'';
  if(!token){say('<b>提交失败</b><br>没读到洛谷页面上的 csrf-token，请刷新洛谷页面后重试。','#ff4d4f');return;}
  say('<b>OIworld 提交</b><br>正在提交到 '+pid+' …（'+(payload.code.length)+' 字节，'+payload.lang+' 号语言）','#1677ff');
  return fetch('/fe/api/problem/submit/'+pid,{
    method:'POST',
    credentials:'same-origin',
    headers:{'Content-Type':'application/json','X-CSRF-TOKEN':token,'x-luogu-type':'content-only'},
    body:JSON.stringify({lang:payload.lang,code:payload.code,enableO2:payload.enableO2?1:0})
  }).then(function(r){return r.json().then(function(json){return {ok:r.ok,status:r.status,json:json};});})
    .then(function(res){
      var rid=res.json&&(res.json.rid||(res.json.data&&res.json.data.rid)||(res.json.currentData&&res.json.currentData.rid));
      if(res.ok&&rid){say('<b>已提交 R'+rid+'</b><br>洛谷正在评测…','#1677ff');poll(rid,0);return;}
      var type=res.json&&res.json.errorType?'':'';
      var message=(res.json&&(res.json.errorMessage||res.json.data))||('HTTP '+res.status);
      if(String(type).match(/Captcha|Verify/i)||/验证码|人机/.test(String(message))){
        say('<b>洛谷要求人机验证</b><br>请先在洛谷手动提交一次这道题，通过验证后再点这个书签。','#faad14');return;
      }
      if(res.status===401||res.status===403){say('<b>没有登录洛谷</b><br>请先在浏览器里登录 luogu.com.cn，再点这个书签。','#ff4d4f');return;}
      say('<b>提交失败</b><br>'+esc(message),'#ff4d4f');
    });
}).catch(function(error){
  if(error&&error.message==='cancel'){say('<b>已取消</b>','#faad14');return;}
  say('<b>提交失败</b><br>'+esc((error&&error.message)||error),'#ff4d4f');
});
})();`;

/** 直接把这段代码拖到书签栏即可安装（部分浏览器需要手动新建书签再粘贴） */
export const BOOKMARKLET_HREF = `javascript:${BOOKMARKLET_CODE}`;

/** 供测试与「复制脚本」使用 */
export const BOOKMARKLET_CODE_SOURCE = BOOKMARKLET_CODE;

/** 书签提交的流程说明里用到的文字 */
export const BOOKMARKLET_NAME = 'OIworld 提交';

/* ------------------------------------------------------------------ *
 * 把代码编码进地址 / 剪贴板
 * ------------------------------------------------------------------ */

export interface LuoguSubmitPayloadInput {
  code: string;
  /** 洛谷语言编号（C++20 = 27 等） */
  lang: number;
  enableO2?: boolean;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** base64url 编码的提交载荷（书签脚本能直接解出来） */
export function encodeLuoguPayload(input: LuoguSubmitPayloadInput): string {
  return toBase64Url(
    JSON.stringify({
      code: input.code,
      lang: input.lang,
      enableO2: input.enableO2 ? 1 : 0,
    }),
  );
}

/** 地址栏能装下的载荷上限（超过就只带语言参数，代码走剪贴板） */
const MAX_PAYLOAD_IN_URL = 3500;

/**
 * 生成「书签提交」要打开的洛谷地址。
 * 载荷太长时只带语言 / O2 参数，代码由剪贴板传过去。
 */
export function buildBookmarkletUrl(
  pid: string,
  input: LuoguSubmitPayloadInput,
): { url: string; payload: string; inUrl: boolean } {
  const payload = encodeLuoguPayload(input);
  const base = `https://www.luogu.com.cn/problem/${encodeURIComponent(pid.trim())}`;
  const inUrl = payload.length <= MAX_PAYLOAD_IN_URL;
  const query = new URLSearchParams();
  if (inUrl) {
    query.set('oiworld', payload);
  } else {
    query.set('oiworld-lang', String(input.lang));
    if (input.enableO2) query.set('oiworld-o2', '1');
  }
  return { url: `${base}?${query.toString()}`, payload, inUrl };
}
