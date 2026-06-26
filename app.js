var FC={apiKey:"AIzaSyAie0hXA1ZYs9ocgZ1V6lseNWk8oWejI_c",authDomain:"capacitaciones-luis-arceo-srl.firebaseapp.com",projectId:"capacitaciones-luis-arceo-srl",storageBucket:"capacitaciones-luis-arceo-srl.firebasestorage.app",messagingSenderId:"114036642100",appId:"1:114036642100:web:9e10fd8ac5406a7a9d1561"};
firebase.initializeApp(FC);
var db=firebase.firestore();
var S={u:null,adm:false,tab:0,pad:[],caps:[],cump:{},ec:null,quiz:null};
var SECTORS=["Cocina y Maestranza","Trailer y Flota Pesada","Administracion"];

function sl(m){document.getElementById("lovo").style.display="flex";document.getElementById("lmsg").textContent=m||"Cargando...";}
function hl(){document.getElementById("lovo").style.display="none";}
function el(id){return document.getElementById(id);}
function ce(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

function om(node){
  var mc=el("modc");
  mc.innerHTML="";
  if(typeof node==="string"){mc.innerHTML=node;}
  else if(node instanceof Node){mc.appendChild(node);}
  el("mov").style.display="flex";
}
function cm(){el("mov").style.display="none";}
function cmbg(ev){if(ev.target===el("mov"))cm();}

async function loadS(){
  var ps=await db.collection("padron").get();
  S.pad=ps.docs.map(function(d){return Object.assign({id:d.id},d.data());});
  var cs=await db.collection("capacitaciones").get();
  S.caps=cs.docs.map(function(d){return Object.assign({id:d.id},d.data());});
  var cu=await db.collection("cumplimientos").get();
  S.cump={};
  cu.docs.forEach(function(d){S.cump[d.id]=d.data();});
}

function sw(t){
  el("tab0").className="tbtn"+(t==="personal"?" act":"");
  el("tab1").className="tbtn"+(t==="admin"?" act":"");
  el("plog").style.display=t==="personal"?"block":"none";
  el("alog").style.display=t==="admin"?"block":"none";
}

function loginP(){
  var n=el("pN").value.trim(),d=el("pD").value.trim(),s=el("pS").value;
  el("pErr").textContent="";
  if(!n||!d||!s){el("pErr").textContent="Completa todos los campos.";return;}
  if(S.pad.length>0&&!S.pad.find(function(p){return p.dni===d;})){
    el("pErr").textContent="DNI no encontrado. Consulta al administrador.";return;
  }
  S.u={nombre:n,dni:d,sector:s};S.adm=false;showApp();
}

function loginA(){
  var u=el("aU").value.trim(),p=el("aP").value.trim();
  el("aErr").textContent="";
  if(u==="Romina"&&p==="R0mina"){S.u={nombre:"Romina",dni:"admin"};S.adm=true;showApp();}
  else{el("aErr").textContent="Usuario o contrasena incorrectos.";}
}

function doLogout(){
  S.u=null;S.adm=false;S.tab=0;
  el("loginScreen").style.display="flex";
  el("mainApp").className="";
  ["pN","pD","aU","aP"].forEach(function(i){el(i).value="";});
  el("pS").value="";
}

function showApp(){
  el("loginScreen").style.display="none";
  el("mainApp").className="vis";
  el("tbtit").textContent=S.adm?"Admin":S.u.nombre;
  buildNav();rt(0);
}

function buildNav(){
  var tabs=S.adm?["Padron","Capacitaciones","Cumplimiento"]:["Capacitaciones","Mis logros"];
  el("navt").innerHTML=tabs.map(function(t,i){
    return '<div class="nt'+(i===S.tab?" act":"")+'" onclick="rt('+i+')">'+t+"</div>";
  }).join("");
}

function rt(i){
  S.tab=i;buildNav();
  if(S.adm){if(i===0)rPad();else if(i===1)rACaps();else rCump();}
  else{if(i===0)rUCaps();else rLogros();}
}

// ========== PADRON ==========
function rPad(){
  var cont=el("cont");
  cont.innerHTML="";
  var card=ce("div","card");

  var ctit=ce("div","ctit");
  ctit.appendChild(ce("span",null,"Personal"));
  var btns=ce("div");btns.style.cssText="display:flex;gap:8px;flex-wrap:wrap";
  var b1=ce("button","btn bbr bsm","+ Agregar");b1.onclick=showAP;
  var lbl=ce("label","btn bol bsm","CSV");
  lbl.style.cursor="pointer";
  var finp=ce("input");finp.type="file";finp.accept=".csv";finp.style.display="none";
  finp.onchange=impCSV;
  lbl.appendChild(finp);
  var b3=ce("button","btn bgo bsm","Exportar");b3.onclick=expCSV;
  btns.appendChild(b1);btns.appendChild(lbl);btns.appendChild(b3);
  ctit.appendChild(btns);
  card.appendChild(ctit);
  card.appendChild(buildPadTable());
  cont.appendChild(card);
}

function buildPadTable(){
  if(!S.pad.length){
    var empty=ce("div","empty");
    empty.appendChild(ce("div","eico",""));
    empty.appendChild(ce("div","etit","Sin personal cargado"));
    return empty;
  }
  var wrap=ce("div","twrap");
  var tbl=ce("table");
  var thead=ce("thead");
  thead.innerHTML="<tr><th>Nombre</th><th>DNI</th><th>Sector</th><th></th></tr>";
  tbl.appendChild(thead);
  var tbody=ce("tbody");
  S.pad.forEach(function(p){
    var tr=ce("tr");
    var td1=ce("td");td1.innerHTML="<strong>"+esc(p.nombre)+"</strong>";
    var td2=ce("td",null,p.dni);
    var td3=ce("td");td3.innerHTML='<span class="bdg bbrn">'+esc(p.sector)+"</span>";
    var td4=ce("td");
    var btn=ce("button","btn brd bsm","X");
    (function(dni){btn.onclick=function(){delP(dni);};})(p.dni);
    td4.appendChild(btn);
    tr.appendChild(td1);tr.appendChild(td2);tr.appendChild(td3);tr.appendChild(td4);
    tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);
  wrap.appendChild(tbl);
  return wrap;
}

function showAP(){
  var d=ce("div");
  var hd=ce("div","mhd");
  hd.appendChild(ce("div","mtit","Agregar persona"));
  var xb=ce("button","cbtn","X");xb.onclick=cm;hd.appendChild(xb);
  d.appendChild(hd);
  d.appendChild(ce("div","gbar"));
  function addFld(lbl,id,type,ph){
    var fg=ce("div","fg");
    var l=ce("label","fl",lbl);
    var inp=ce("input","fi");inp.id=id;inp.placeholder=ph;if(type)inp.type=type;
    fg.appendChild(l);fg.appendChild(inp);d.appendChild(fg);
  }
  addFld("Nombre y Apellido","nNom","text","Nombre completo");
  addFld("DNI","nDni","number","Numero de DNI");
  var fg=ce("div","fg");
  fg.appendChild(ce("label","fl","Sector"));
  var sel=ce("select","fs");sel.id="nSec";
  ["","Cocina y Maestranza","Trailer y Flota Pesada","Administracion"].forEach(function(v){
    var o=ce("option",null,v||"Selecciona...");o.value=v;sel.appendChild(o);
  });
  fg.appendChild(sel);d.appendChild(fg);
  var sb=ce("button","btn bbr","Guardar");sb.style.width="100%";sb.onclick=saveP;
  d.appendChild(sb);
  om(d);
}

async function saveP(){
  var n=el("nNom").value.trim(),d=el("nDni").value.trim(),s=el("nSec").value;
  if(!n||!d||!s){alert("Completa todos los campos.");return;}
  if(S.pad.find(function(p){return p.dni===d;})){alert("Ya existe una persona con ese DNI.");return;}
  sl("Guardando...");
  try{
    await db.collection("padron").doc(d).set({nombre:n,dni:d,sector:s});
    S.pad.push({nombre:n,dni:d,sector:s});
    cm();rPad();
  }catch(ex){alert("Error al guardar.");}finally{hl();}
}

async function delP(dni){
  if(!confirm("Eliminar esta persona?"))return;
  sl("Eliminando...");
  try{
    await db.collection("padron").doc(dni).delete();
    S.pad=S.pad.filter(function(p){return p.dni!==dni;});
    rPad();
  }catch(ex){alert("Error.");}finally{hl();}
}

function impCSV(ev){
  var f=ev.target.files[0];if(!f)return;
  var r=new FileReader();
  r.onload=async function(x){
    var ls=x.target.result.split("\n").filter(function(l){return l.trim();});
    var added=0;
    for(var l of ls){
      var pts=l.split(",").map(function(s){return s.trim().replace(/"/g,"");});
      if(pts.length>=3&&pts[0]&&pts[1]&&pts[2]&&!S.pad.find(function(p){return p.dni===pts[1];})){
        try{
          await db.collection("padron").doc(pts[1]).set({nombre:pts[0],dni:pts[1],sector:pts[2]});
          S.pad.push({nombre:pts[0],dni:pts[1],sector:pts[2]});
          added++;
        }catch(e){}
      }
    }
    rPad();alert(added+" personas importadas.");
  };
  r.readAsText(f);
}

function expCSV(){
  var rows=[["Nombre","DNI","Sector"]];
  S.pad.forEach(function(p){rows.push([p.nombre,p.dni,p.sector]);});
  dCSV(rows,"padron.csv");
}

// ========== CAPACITACIONES ADMIN ==========
function rACaps(){
  var cont=el("cont");cont.innerHTML="";
  var card=ce("div","card");
  var ctit=ce("div","ctit");
  ctit.appendChild(ce("span",null,"Capacitaciones"));
  var nb=ce("button","btn bbr bsm","+ Nueva");nb.onclick=newCap;
  ctit.appendChild(nb);
  card.appendChild(ctit);
  buildCapsList(card);
  cont.appendChild(card);
}

function buildCapsList(card){
  if(!S.caps.length){
    var empty=ce("div","empty");
    empty.appendChild(ce("div","eico",""));
    empty.appendChild(ce("div","etit","Sin capacitaciones"));
    card.appendChild(empty);return;
  }
  S.caps.forEach(function(c){
    var trc=ce("div","trc");
    var row=ce("div");row.style.cssText="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px";
    var info=ce("div");info.style.cssText="flex:1;min-width:0";
    info.appendChild(ce("h3",null,c.titulo));
    var meta=ce("div","tmeta");
    if(c.fileName)meta.appendChild(ce("span",null,c.fileName));
    meta.appendChild(ce("span",null,(c.preguntas?c.preguntas.length:0)+" preguntas"));
    var secTxt=c.sectores&&c.sectores.length>0?c.sectores.join(", "):"Todos los sectores";
    var secSpan=ce("span");secSpan.style.cssText="color:"+(c.sectores&&c.sectores.length>0?"#b8860b":"#1a6632")+";font-weight:600;font-size:11px";
    secSpan.textContent=secTxt;
    meta.appendChild(secSpan);
    info.appendChild(meta);
    var btns=ce("div");btns.style.cssText="display:flex;gap:6px;flex-shrink:0";
    var eb=ce("button","btn bol bsm","Editar");
    (function(id){eb.onclick=function(){editCap(id);};})(c.id);
    var db2=ce("button","btn brd bsm","X");
    (function(id){db2.onclick=function(){delCap(id);};})(c.id);
    btns.appendChild(eb);btns.appendChild(db2);
    row.appendChild(info);row.appendChild(btns);
    trc.appendChild(row);card.appendChild(trc);
  });
}

function newCap(){
  S.ec={titulo:"",fileData:null,fileName:"",fileType:"",sectores:[],preguntas:Array(6).fill(null).map(function(){return{texto:"",opciones:["","",""],respuesta:0};})};
  openCapForm();
}

function editCap(id){
  var c=S.caps.find(function(x){return x.id===id;});
  if(!c)return;
  S.ec=JSON.parse(JSON.stringify(c));
  if(!S.ec.sectores)S.ec.sectores=[];
  while(S.ec.preguntas.length<6)S.ec.preguntas.push({texto:"",opciones:["","",""],respuesta:0});
  openCapForm();
}

function openCapForm(){
  var c=S.ec;
  var d=ce("div");
  var hd=ce("div","mhd");
  hd.appendChild(ce("div","mtit",(c.id?"Editar":"Nueva")+" Capacitacion"));
  var xb=ce("button","cbtn","X");xb.onclick=cm;hd.appendChild(xb);
  d.appendChild(hd);
  d.appendChild(ce("div","gbar"));

  // Titulo
  var fg1=ce("div","fg");
  fg1.appendChild(ce("label","fl","Titulo"));
  var titInp=ce("input","fi");titInp.id="cTit";titInp.placeholder="Nombre de la capacitacion";titInp.value=c.titulo||"";
  fg1.appendChild(titInp);d.appendChild(fg1);

  // Sectores
  var fgSec=ce("div","fg");
  fgSec.appendChild(ce("label","fl","Sectores destinatarios"));
  var secHint=ce("div");secHint.style.cssText="font-size:11px;color:#6b5c4e;margin-bottom:8px";
  secHint.textContent="Sin seleccion = visible para todos los sectores";
  fgSec.appendChild(secHint);
  SECTORS.forEach(function(sec){
    var row=ce("div");row.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:6px";
    var cb=ce("input");cb.type="checkbox";cb.value=sec;
    var safeId="cb_"+sec.replace(/[^a-z]/gi,"_");
    cb.id=safeId;cb.style.cssText="width:16px;height:16px;cursor:pointer;accent-color:#b8860b";
    if(c.sectores&&c.sectores.indexOf(sec)>=0)cb.checked=true;
    var lb=ce("label",null,sec);lb.htmlFor=safeId;lb.style.cssText="font-size:13px;color:#3a2317;cursor:pointer";
    row.appendChild(cb);row.appendChild(lb);fgSec.appendChild(row);
  });
  d.appendChild(fgSec);

  // Archivo
  var fg2=ce("div","fg");
  fg2.appendChild(ce("label","fl","Archivo PDF o PowerPoint"));
  var drop=ce("div","fdrop");
  var dropIco=ce("div");dropIco.style.cssText="font-size:28px;margin-bottom:6px";dropIco.textContent="Subir archivo";
  var dropLbl=ce("div");dropLbl.id="fLbl";dropLbl.style.fontWeight="600";
  dropLbl.textContent=c.fileName?"OK: "+c.fileName:"Toca para subir PDF o PPT (max 15MB)";
  var finp=ce("input");finp.type="file";finp.id="fInp";finp.accept=".pdf,.ppt,.pptx";finp.style.display="none";
  finp.onchange=hFU;
  drop.onclick=function(){finp.click();};
  drop.appendChild(dropIco);drop.appendChild(dropLbl);drop.appendChild(finp);
  fg2.appendChild(drop);d.appendChild(fg2);

  // Preguntas
  var qdiv=ce("div");
  var qlbl=ce("div");qlbl.style.cssText="font-size:12px;font-weight:700;color:#6b5c4e;margin-bottom:10px;text-transform:uppercase";
  qlbl.textContent="6 preguntas de evaluacion";
  qdiv.appendChild(qlbl);
  c.preguntas.forEach(function(q,qi){
    var qb=ce("div","qbox");
    qb.appendChild(ce("div","qnum","Pregunta "+(qi+1)));
    var qt=ce("input");qt.type="text";qt.id="qt"+qi;qt.value=q.texto||"";qt.placeholder="Escribe la pregunta";
    qt.style.cssText="width:100%;padding:8px 11px;border:1.5px solid #e0d8cc;border-radius:6px;font-size:13px;color:#3a2317;margin-bottom:8px;outline:none;background:white";
    qb.appendChild(qt);
    [0,1,2].forEach(function(oi){
      var or=ce("div");or.style.cssText="display:flex;gap:8px;align-items:center;margin-bottom:6px";
      var radio=ce("input");radio.type="radio";radio.name="cr"+qi;radio.value=String(oi);
      if(q.respuesta===oi)radio.checked=true;
      radio.style.cssText="width:16px;height:16px;cursor:pointer;accent-color:#b8860b";
      (function(q2,oi2){radio.onchange=function(){q2.respuesta=oi2;};})(q,oi);
      var oinp=ce("input");oinp.type="text";oinp.id="qo"+qi+"i"+oi;oinp.value=q.opciones[oi]||"";
      oinp.placeholder="Opcion "+(oi+1);
      oinp.style.cssText="flex:1;padding:8px 11px;border:1.5px solid #e0d8cc;border-radius:6px;font-size:13px;color:#3a2317;outline:none;background:white";
      or.appendChild(radio);or.appendChild(oinp);qb.appendChild(or);
    });
    var hint=ce("div");hint.style.cssText="font-size:11px;color:#a09080;margin-top:4px";
    hint.textContent="Marca el circulo de la respuesta correcta";
    qb.appendChild(hint);qdiv.appendChild(qb);
  });
  d.appendChild(qdiv);

  var sb=ce("button","btn bgn","Guardar capacitacion");
  sb.style.cssText="width:100%;margin-top:8px;padding:12px";sb.onclick=saveCap;
  d.appendChild(sb);
  om(d);
}

function hFU(ev){
  var f=ev.target.files[0];if(!f)return;
  if(f.size>15*1024*1024){alert("Archivo muy grande (max 15MB).");return;}
  el("fLbl").textContent="Cargando "+f.name+"...";
  var r=new FileReader();
  r.onload=function(x){
    S.ec.fileData=x.target.result;S.ec.fileName=f.name;S.ec.fileType=f.type;
    el("fLbl").textContent="OK: "+f.name;
  };
  r.readAsDataURL(f);
}

async function saveCap(){
  var tit=el("cTit").value.trim();
  if(!tit){alert("Ingresa un titulo.");return;}
  var secs=[];
  SECTORS.forEach(function(sec){
    var safeId="cb_"+sec.replace(/[^a-z]/gi,"_");
    var cb=el(safeId);
    if(cb&&cb.checked)secs.push(sec);
  });
  var qs=S.ec.preguntas.map(function(q,qi){
    return{
      texto:el("qt"+qi).value.trim()||q.texto,
      opciones:[0,1,2].map(function(oi){return el("qo"+qi+"i"+oi).value.trim();}),
      respuesta:q.respuesta
    };
  });
  for(var i=0;i<qs.length;i++){
    if(!qs[i].texto){alert("Completa la pregunta "+(i+1)+".");return;}
    if(qs[i].opciones.some(function(o){return!o;})){alert("Completa las opciones de la pregunta "+(i+1)+".");return;}
  }
  var cap={
    titulo:tit,
    fileData:S.ec.fileData||"",
    fileName:S.ec.fileName||"",
    fileType:S.ec.fileType||"",
    sectores:secs,
    preguntas:qs,
    creado:S.ec.creado||new Date().toLocaleDateString("es-AR")
  };
  if(S.ec.id)cap.id=S.ec.id;
  sl("Guardando...");
  try{
    var id=S.ec.id||("cap_"+Date.now());cap.id=id;
    await db.collection("capacitaciones").doc(id).set(cap);
    if(S.ec.id){
      var idx=S.caps.findIndex(function(c){return c.id===S.ec.id;});
      if(idx>=0)S.caps[idx]=cap;
    }else{S.caps.push(cap);}
    cm();rACaps();
  }catch(ex){alert("Error al guardar. El archivo puede ser demasiado grande.");}finally{hl();}
}

async function delCap(id){
  if(!confirm("Eliminar esta capacitacion?"))return;
  sl("Eliminando...");
  try{
    await db.collection("capacitaciones").doc(id).delete();
    S.caps=S.caps.filter(function(c){return c.id!==id;});
    rACaps();
  }catch(ex){alert("Error.");}finally{hl();}
}

// ========== CUMPLIMIENTO ==========
function rCump(){
  var cont=el("cont");cont.innerHTML="";
  var tc=S.caps.length,cd=0,pd=0;
  var rows=S.pad.map(function(p){
    var comp=S.caps.filter(function(c){
      if(c.sectores&&c.sectores.length>0&&c.sectores.indexOf(p.sector)<0)return false;
      var k=p.dni+"_"+c.id;return S.cump[k]&&S.cump[k].aprobado;
    }).length;
    var total=S.caps.filter(function(c){
      return !c.sectores||c.sectores.length===0||c.sectores.indexOf(p.sector)>=0;
    }).length;
    var pct=total>0?Math.round((comp/total)*100):0;
    if(pct===100)cd++;else pd++;
    return{p:p,comp:comp,total:total,pct:pct};
  });

  // Stats
  var sgrid=ce("div","sgrid");
  function sbox(n,l,cls){var b=ce("div","sbox"+(cls?" "+cls:""));b.appendChild(ce("div","snum",String(n)));b.appendChild(ce("div","slbl",l));return b;}
  sgrid.appendChild(sbox(S.pad.length,"Personal"));
  sgrid.appendChild(sbox(tc,"Capacitaciones"));
  sgrid.appendChild(sbox(cd,"Completaron todo","sgn"));
  sgrid.appendChild(sbox(pd,"Con pendientes","syl"));
  cont.appendChild(sgrid);

  // Table
  var card=ce("div","card");
  var ctit=ce("div","ctit");
  ctit.appendChild(ce("span",null,"Detalle por persona"));
  var expb=ce("button","btn bgn bsm","Exportar Excel");expb.onclick=expXL;
  ctit.appendChild(expb);card.appendChild(ctit);
  if(!rows.length){
    card.appendChild(ce("div",null,"Sin personal en el padron."));
  }else{
    var wrap=ce("div","twrap");
    var tbl=ce("table");
    tbl.innerHTML="<thead><tr><th>Nombre</th><th>DNI</th><th>Sector</th><th>Avance</th><th>Estado</th></tr></thead>";
    var tbody=ce("tbody");
    rows.forEach(function(r){
      var tr=ce("tr");
      var td1=ce("td");td1.innerHTML="<strong>"+esc(r.p.nombre)+"</strong>";
      var td2=ce("td",null,r.p.dni);
      var td3=ce("td");td3.innerHTML='<span class="bdg bbrn">'+esc(r.p.sector)+"</span>";
      var td4=ce("td");
      var pbwrap=ce("div");pbwrap.style.minWidth="80px";
      var pblbl=ce("div");pblbl.style.cssText="font-size:11px;color:#6b5c4e;margin-bottom:3px";pblbl.textContent=r.comp+"/"+r.total;
      var pb=ce("div","pb");var pf=ce("div","pf"+(r.pct===100?" full":""));pf.style.width=r.pct+"%";pb.appendChild(pf);
      pbwrap.appendChild(pblbl);pbwrap.appendChild(pb);td4.appendChild(pbwrap);
      var td5=ce("td");
      var cls=r.pct===100?"bgn2":r.pct>0?"byl":"brd2";
      var txt=r.pct===100?"Completo":r.pct>0?r.pct+"%":"Pendiente";
      td5.innerHTML='<span class="bdg '+cls+'">'+txt+"</span>";
      tr.appendChild(td1);tr.appendChild(td2);tr.appendChild(td3);tr.appendChild(td4);tr.appendChild(td5);
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);wrap.appendChild(tbl);card.appendChild(wrap);
  }
  cont.appendChild(card);

  // Per cap
  S.caps.forEach(function(c){
    var targetPad=S.pad.filter(function(p){return !c.sectores||c.sectores.length===0||c.sectores.indexOf(p.sector)>=0;});
    var ap=targetPad.filter(function(p){var k=p.dni+"_"+c.id;return S.cump[k]&&S.cump[k].aprobado;});
    var capCard=ce("div","card");
    var cctit=ce("div","ctit");
    var titSpan=ce("span",null,c.titulo);
    var secLbl=c.sectores&&c.sectores.length>0?c.sectores.join(", "):"Todos los sectores";
    var secBdg=ce("span","bdg bbrn",secLbl);secBdg.style.fontSize="10px";
    var cntBdg=ce("span","bdg bbrn",ap.length+"/"+targetPad.length+" aprobaron");
    var bdgRow=ce("div");bdgRow.style.cssText="display:flex;gap:6px;align-items:center;flex-wrap:wrap";
    bdgRow.appendChild(secBdg);bdgRow.appendChild(cntBdg);
    cctit.appendChild(titSpan);cctit.appendChild(bdgRow);capCard.appendChild(cctit);
    if(ap.length){
      var w=ce("div","twrap");var t=ce("table");
      t.innerHTML="<thead><tr><th>Nombre</th><th>Sector</th><th>Nota</th><th>Fecha</th></tr></thead>";
      var tb=ce("tbody");
      ap.forEach(function(p){var cu=S.cump[p.dni+"_"+c.id];var tr=ce("tr");
        tr.innerHTML="<td>"+esc(p.nombre)+"</td><td>"+esc(p.sector)+'</td><td><span class="bdg bgn2">'+cu.nota+'%</span></td><td style="font-size:12px;color:#6b5c4e">'+(cu.fecha||"")+"</td>";
        tb.appendChild(tr);});
      t.appendChild(tb);w.appendChild(t);capCard.appendChild(w);
    }else{
      var noap=ce("div");noap.style.cssText="font-size:13px;color:#a09080;padding:8px 0";noap.textContent="Nadie aprobo todavia.";capCard.appendChild(noap);
    }
    cont.appendChild(capCard);
  });
}

function expXL(){
  var rows=[["Nombre","DNI","Sector","Completadas","Total","Porcentaje","Estado"]];
  S.pad.forEach(function(p){
    var total=S.caps.filter(function(c){return !c.sectores||c.sectores.length===0||c.sectores.indexOf(p.sector)>=0;}).length;
    var comp=S.caps.filter(function(c){
      if(c.sectores&&c.sectores.length>0&&c.sectores.indexOf(p.sector)<0)return false;
      var k=p.dni+"_"+c.id;return S.cump[k]&&S.cump[k].aprobado;
    }).length;
    var pct=total>0?Math.round((comp/total)*100):0;
    rows.push([p.nombre,p.dni,p.sector,comp,total,pct+"%",pct===100?"Completo":pct>0?"Parcial":"Pendiente"]);
  });
  dCSV(rows,"cumplimiento.csv");alert("Exportado!");
}

// ========== USUARIO: CAPACITACIONES ==========
function getCapsForUser(){
  var sec=S.u.sector;
  return S.caps.filter(function(c){return !c.sectores||c.sectores.length===0||c.sectores.indexOf(sec)>=0;});
}

function rUCaps(){
  var cont=el("cont");cont.innerHTML="";
  var mycaps=getCapsForUser();
  var card=ce("div","card");
  card.appendChild(ce("div","ctit","Capacitaciones disponibles"));
  if(!mycaps.length){
    var empty=ce("div","empty");
    empty.appendChild(ce("div","eico",""));
    empty.appendChild(ce("div","etit","Sin capacitaciones para tu sector"));
    card.appendChild(empty);cont.appendChild(card);return;
  }
  mycaps.forEach(function(c){
    var key=S.u.dni+"_"+c.id,cu=S.cump[key],ap=!!(cu&&cu.aprobado);
    var trc=ce("div","trc");
    (function(id){trc.onclick=function(){verCap(id);};})(c.id);
    var row=ce("div");row.style.cssText="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px";
    var info=ce("div");info.style.cssText="flex:1;min-width:0";
    info.appendChild(ce("h3",null,c.titulo));
    var meta=ce("div","tmeta");
    if(c.fileName)meta.appendChild(ce("span",null,c.fileName));
    meta.appendChild(ce("span",null,c.preguntas.length+" preguntas"));
    info.appendChild(meta);
    var bdg=ce("span","bdg "+(ap?"bgn2":"byl"),ap?"Aprobada "+cu.nota+"%":"Pendiente");
    row.appendChild(info);row.appendChild(bdg);trc.appendChild(row);card.appendChild(trc);
  });
  cont.appendChild(card);
}

function verCap(id){
  var c=S.caps.find(function(x){return x.id===id;});if(!c)return;
  var key=S.u.dni+"_"+c.id,cu=S.cump[key],ap=!!(cu&&cu.aprobado);
  var d=ce("div");
  var hd=ce("div","mhd");
  hd.appendChild(ce("div","mtit",c.titulo));
  var xb=ce("button","cbtn","X");xb.onclick=cm;hd.appendChild(xb);
  d.appendChild(hd);d.appendChild(ce("div","gbar"));

  if(c.fileData){
    var fdiv=ce("div");fdiv.style.marginBottom="16px";
    var ftit=ce("div");ftit.style.cssText="font-size:12px;font-weight:700;color:#6b5c4e;margin-bottom:8px";
    if(c.fileType&&c.fileType.indexOf("pdf")>=0){
      ftit.textContent="CONTENIDO DEL CURSO";
      var fw=ce("div");fw.style.cssText="background:#f5f2ee;border:1px solid #e0d8cc;border-radius:8px;overflow:hidden";
      var emb=document.createElement("embed");emb.src=c.fileData;emb.type="application/pdf";emb.width="100%";emb.height="480px";emb.style.display="block";
      fw.appendChild(emb);
    }else{
      ftit.textContent="MATERIAL DE ESTUDIO";
      var fw=ce("div");fw.style.cssText="background:#faf3e8;border:1px solid #e0d8cc;border-radius:8px;padding:20px;text-align:center";
      var fn=ce("div");fn.style.cssText="font-size:14px;font-weight:600;color:#3a2317;margin-bottom:14px";fn.textContent=c.fileName;
      var dl=document.createElement("a");dl.href=c.fileData;dl.download=c.fileName;
      dl.style.cssText="display:inline-block;padding:10px 20px;background:#3a2317;color:white;border-radius:7px;font-size:13px;font-weight:700;text-decoration:none";
      dl.textContent="Descargar archivo";
      fw.appendChild(fn);fw.appendChild(dl);
    }
    fdiv.appendChild(ftit);fdiv.appendChild(fw);d.appendChild(fdiv);
  }else{
    var nofile=ce("div");nofile.style.cssText="background:#f0f4f8;border-radius:8px;padding:20px;text-align:center;color:#a0aec0;margin-bottom:16px";
    nofile.textContent="Sin archivo adjunto";d.appendChild(nofile);
  }

  if(ap){
    var apb=ce("div","apbanner");
    apb.innerHTML='<div style="font-size:28px;margin-bottom:4px">&#127891;</div><div style="font-weight:800;color:#1a6632">Capacitacion aprobada!</div><div style="font-size:12px;color:#2d6e44;margin-top:3px">Nota: '+cu.nota+'% - '+cu.fecha+'</div>';
    d.appendChild(apb);
  }else{
    var rbtn=ce("button","btn bbr","Rendir evaluacion");
    rbtn.style.cssText="width:100%;padding:13px;font-size:15px";
    (function(id){rbtn.onclick=function(){startQ(id);};})(c.id);
    d.appendChild(rbtn);
    var hint=ce("div");hint.style.cssText="font-size:12px;color:#6b5c4e;text-align:center;margin-top:8px";
    hint.textContent="Se necesita 70% o mas para aprobar";d.appendChild(hint);
  }
  om(d);
}

// ========== QUIZ ==========
function startQ(id){
  var c=S.caps.find(function(x){return x.id===id;});if(!c)return;
  S.quiz={id:c.id,preguntas:c.preguntas,resp:Array(c.preguntas.length).fill(null),step:0};
  rQ();
}

function rQ(){
  var q=S.quiz,p=q.preguntas[q.step],sel=q.resp[q.step];
  var L=["A","B","C"];
  var d=ce("div");
  var hd=ce("div","mhd");
  hd.appendChild(ce("div","mtit","Evaluacion - "+(q.step+1)+" de "+q.preguntas.length));
  var xb=ce("button","cbtn","X");xb.onclick=cm;hd.appendChild(xb);
  d.appendChild(hd);d.appendChild(ce("div","gbar"));

  var pb=ce("div","pb");pb.style.cssText="margin-bottom:20px;height:6px";
  var pf=ce("div","pf");pf.style.width=Math.round(((q.step+1)/q.preguntas.length)*100)+"%";
  pb.appendChild(pf);d.appendChild(pb);

  var qtxt=ce("div");qtxt.style.cssText="font-size:15px;font-weight:700;color:#3a2317;margin-bottom:18px;line-height:1.45";
  qtxt.textContent=p.texto;d.appendChild(qtxt);

  p.opciones.forEach(function(op,oi){
    var opt=ce("div","qo"+(sel===oi?" sel":""));
    var ltr=ce("div","ql",L[oi]);
    var txt=ce("span",null,op);
    opt.appendChild(ltr);opt.appendChild(txt);
    (function(oi2){opt.onclick=function(){sa(oi2);};})(oi);
    d.appendChild(opt);
  });

  var brow=ce("div");brow.style.cssText="display:flex;gap:10px;margin-top:18px";
  if(q.step>0){var pb2=ce("button","btn bol","Anterior");pb2.onclick=qP;brow.appendChild(pb2);}
  if(q.step<q.preguntas.length-1){
    var nb=ce("button","btn bbr","Siguiente");nb.style.flex="1";if(sel===null)nb.disabled=true;nb.onclick=qN;brow.appendChild(nb);
  }else{
    var fb=ce("button","btn bgn","Finalizar");fb.style.flex="1";if(sel===null)fb.disabled=true;fb.onclick=subQ;brow.appendChild(fb);
  }
  d.appendChild(brow);
  om(d);
}

function sa(oi){S.quiz.resp[S.quiz.step]=oi;rQ();}
function qN(){if(S.quiz.resp[S.quiz.step]===null)return;S.quiz.step++;rQ();}
function qP(){S.quiz.step--;rQ();}

async function subQ(){
  var q=S.quiz,cor=0;
  q.preguntas.forEach(function(p,i){if(q.resp[i]===p.respuesta)cor++;});
  var nota=Math.round((cor/q.preguntas.length)*100),ap=nota>=70;
  if(ap){
    var key=S.u.dni+"_"+q.id;
    var data={aprobado:true,nota:nota,fecha:new Date().toLocaleDateString("es-AR"),nombre:S.u.nombre,sector:S.u.sector};
    sl("Registrando resultado...");
    try{await db.collection("cumplimientos").doc(key).set(data);S.cump[key]=data;}
    catch(ex){console.error(ex);}finally{hl();}
  }
  var d=ce("div");d.style.cssText="text-align:center;padding:20px 10px";
  var ico=ce("div");ico.style.cssText="font-size:60px;margin-bottom:12px";ico.textContent=ap?"":"";
  var sc=ce("div");sc.style.cssText="font-size:52px;font-weight:900;margin-bottom:6px;color:"+(ap?"#1a6632":"#8b1a1a");sc.textContent=nota+"%";
  var tl=ce("div");tl.style.cssText="font-size:18px;font-weight:800;margin-bottom:10px;color:"+(ap?"#1a6632":"#8b1a1a");tl.textContent=ap?"Aprobado!":"No aprobado";
  var msg=ce("div");msg.style.cssText="font-size:14px;color:#6b5c4e;line-height:1.5";
  msg.textContent=cor+" respuestas correctas de "+q.preguntas.length+". "+(ap?"Capacitacion completada con exito!":"Se necesita 70% para aprobar.");
  var brow=ce("div");brow.style.cssText="margin-top:22px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap";
  if(!ap){
    var rb=ce("button","btn bol","Intentar de nuevo");
    (function(id){rb.onclick=function(){startQ(id);};})(q.id);brow.appendChild(rb);
  }
  var vb=ce("button","btn bbr","Volver");vb.onclick=function(){cm();rUCaps();};brow.appendChild(vb);
  d.appendChild(ico);d.appendChild(sc);d.appendChild(tl);d.appendChild(msg);d.appendChild(brow);
  om(d);
}

// ========== MIS LOGROS ==========
function rLogros(){
  var cont=el("cont");cont.innerHTML="";
  var mycaps=getCapsForUser();
  var caps=mycaps.map(function(c){var key=S.u.dni+"_"+c.id,cu=S.cump[key];return{c:c,cu:cu,ap:!!(cu&&cu.aprobado)};});
  var apd=caps.filter(function(x){return x.ap;}),pend=caps.filter(function(x){return!x.ap;});
  var pct=mycaps.length>0?Math.round((apd.length/mycaps.length)*100):0;

  var progCard=ce("div","card");progCard.style.cssText="text-align:center;padding:22px";
  var ptit=ce("div");ptit.style.cssText="font-size:13px;color:#6b5c4e;font-weight:600;margin-bottom:6px";ptit.textContent="TU PROGRESO";
  var pnum=ce("div");pnum.style.cssText="font-size:50px;font-weight:900;color:"+(pct===100?"#1a6632":"#3a2317");pnum.textContent=pct+"%";
  var pb=ce("div","pb");pb.style.cssText="margin:14px 0;height:10px";
  var pf=ce("div","pf"+(pct===100?" full":""));pf.style.width=pct+"%";pb.appendChild(pf);
  var plbl=ce("div");plbl.style.cssText="font-size:13px;color:#6b5c4e";plbl.textContent=apd.length+" de "+mycaps.length+" completadas";
  progCard.appendChild(ptit);progCard.appendChild(pnum);progCard.appendChild(pb);progCard.appendChild(plbl);
  if(pct===100){var congrat=ce("div");congrat.style.cssText="margin-top:10px;font-size:13px;font-weight:700;color:#1a6632";congrat.textContent="Completaste todas las capacitaciones!";progCard.appendChild(congrat);}
  cont.appendChild(progCard);

  if(apd.length){
    var ac=ce("div","card");ac.appendChild(ce("div","ctit","Aprobadas"));
    apd.forEach(function(x){
      var trc=ce("div","trc");trc.style.cssText="cursor:default;border-color:#a8d5b5;background:#f6fbf8";
      var row=ce("div");row.style.cssText="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px";
      var info=ce("div");
      var h3=ce("h3",null,x.c.titulo);h3.style.color="#1a6632";
      var meta=ce("div","tmeta");
      meta.appendChild(ce("span",null,"Nota: "+x.cu.nota+"%"));
      meta.appendChild(ce("span",null,x.cu.fecha||""));
      info.appendChild(h3);info.appendChild(meta);
      row.appendChild(info);row.appendChild(ce("span","bdg bgn2","Aprobada"));
      trc.appendChild(row);ac.appendChild(trc);
    });
    cont.appendChild(ac);
  }

  if(pend.length){
    var pc=ce("div","card");pc.appendChild(ce("div","ctit","Pendientes"));
    pend.forEach(function(x){
      var trc=ce("div","trc");
      (function(id){trc.onclick=function(){verCap(id);};})(x.c.id);
      var row=ce("div");row.style.cssText="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px";
      var info=ce("div");
      info.appendChild(ce("h3",null,x.c.titulo));
      var meta=ce("div","tmeta");meta.appendChild(ce("span",null,"Toca para ver y rendir"));
      info.appendChild(meta);
      row.appendChild(info);row.appendChild(ce("span","bdg byl","Pendiente"));
      trc.appendChild(row);pc.appendChild(trc);
    });
    cont.appendChild(pc);
  }

  if(!mycaps.length){
    var empty=ce("div","card");var e2=ce("div","empty");
    e2.appendChild(ce("div","eico",""));e2.appendChild(ce("div","etit","Sin capacitaciones para tu sector"));
    empty.appendChild(e2);cont.appendChild(empty);
  }
}

// ========== UTILS ==========
function dCSV(rows,fn){
  var lines=rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,"''")+'"';}).join(",");});
  var blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});
  var url=URL.createObjectURL(blob);
  var a=document.createElement("a");a.href=url;a.download=fn;a.click();
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
}

loadS().then(function(){
  hl();
  el("loginScreen").style.display="flex";
}).catch(function(ex){
  console.error(ex);
  el("lmsg").textContent="Error al conectar. Recarga la pagina.";
});
