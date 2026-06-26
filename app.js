
function triggerFileInput(){var el=document.getElementById('fInp');if(el)el.click();}

var FC={apiKey:"AIzaSyAie0hXA1ZYs9ocgZ1V6lseNWk8oWejI_c",authDomain:"capacitaciones-luis-arceo-srl.firebaseapp.com",projectId:"capacitaciones-luis-arceo-srl",storageBucket:"capacitaciones-luis-arceo-srl.firebasestorage.app",messagingSenderId:"114036642100",appId:"1:114036642100:web:9e10fd8ac5406a7a9d1561"};
firebase.initializeApp(FC);
var db=firebase.firestore();
var S={u:null,adm:false,tab:0,pad:[],caps:[],cump:{},ec:null,quiz:null};

function sl(m){document.getElementById("lovo").style.display="flex";document.getElementById("lmsg").textContent=m||"Cargando...";}
function hl(){document.getElementById("lovo").style.display="none";}

async function loadS(){
  var ps=await db.collection("padron").get();
  S.pad=ps.docs.map(function(d){return Object.assign({id:d.id},d.data());});
  var cs=await db.collection("capacitaciones").get();
  S.caps=cs.docs.map(function(d){return Object.assign({id:d.id},d.data());});
  var cu=await db.collection("cumplimientos").get();
  S.cump={};
  cu.docs.forEach(function(d){S.cump[d.id]=d.data();});
}

function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function om(h){document.getElementById("modc").innerHTML=h;document.getElementById("mov").style.display="flex";}
function cm(){document.getElementById("mov").style.display="none";}
function cmbg(ev){if(ev.target===document.getElementById("mov"))cm();}

function sw(t){
  document.getElementById("tab0").className="tbtn"+(t==="personal"?" act":"");
  document.getElementById("tab1").className="tbtn"+(t==="admin"?" act":"");
  document.getElementById("plog").style.display=t==="personal"?"block":"none";
  document.getElementById("alog").style.display=t==="admin"?"block":"none";
}

function loginP(){
  var n=document.getElementById("pN").value.trim(),d=document.getElementById("pD").value.trim(),s=document.getElementById("pS").value;
  document.getElementById("pErr").textContent="";
  if(!n||!d||!s){document.getElementById("pErr").textContent="Completa todos los campos.";return;}
  if(S.pad.length>0&&!S.pad.find(function(p){return p.dni===d;})){document.getElementById("pErr").textContent="DNI no encontrado. Consulta al administrador.";return;}
  S.u={nombre:n,dni:d,sector:s};S.adm=false;showApp();
}

function loginA(){
  var u=document.getElementById("aU").value.trim(),p=document.getElementById("aP").value.trim();
  document.getElementById("aErr").textContent="";
  if(u==="Romina"&&p==="R0mina"){S.u={nombre:"Romina",dni:"admin"};S.adm=true;showApp();}
  else{document.getElementById("aErr").textContent="Usuario o contrasena incorrectos.";}
}

function doLogout(){
  S.u=null;S.adm=false;S.tab=0;
  document.getElementById("loginScreen").style.display="flex";
  document.getElementById("mainApp").className="";
  ["pN","pD","aU","aP"].forEach(function(i){document.getElementById(i).value="";});
  document.getElementById("pS").value="";
}

function showApp(){
  document.getElementById("loginScreen").style.display="none";
  document.getElementById("mainApp").className="vis";
  document.getElementById("tbtit").textContent=S.adm?"Admin":S.u.nombre;
  buildNav();rt(0);
}

function buildNav(){
  var tabs=S.adm?["Padron","Capacitaciones","Cumplimiento"]:["Capacitaciones","Mis logros"];
  document.getElementById("navt").innerHTML=tabs.map(function(t,i){
    return '<div class="nt'+(i===S.tab?" act":"")+'" onclick="rt('+i+')">'+t+"</div>";
  }).join("");
}

function rt(i){S.tab=i;buildNav();if(S.adm){if(i===0)rPad();else if(i===1)rACaps();else rCump();}else{if(i===0)rUCaps();else rLogros();}}

function rPad(){
  var h='<div class="card">';
  h+='<div class="ctit"><span>Personal</span>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap">';
  h+='<button class="btn bbr bsm" onclick="showAP()">+ Agregar</button>';
  h+='<label class="btn bol bsm" style="cursor:pointer">CSV<input type="file" accept=".csv" style="display:none" onchange="impCSV(event)"></label>';
  h+='<button class="btn bgo bsm" onclick="expCSV()">Exportar</button>';
  h+='</div></div>';
  h+=rPadTbl();
  h+='</div>';
  document.getElementById("cont").innerHTML=h;
}

function rPadTbl(){
  if(!S.pad.length)return '<div class="empty"><div class="eico">&#128100;</div><div class="etit">Sin personal cargado</div></div>';
  var wrap=document.createElement("div");wrap.className="twrap";
  var tbl=document.createElement("table");
  tbl.innerHTML='<thead><tr><th>Nombre</th><th>DNI</th><th>Sector</th><th></th></tr></thead>';
  var tbody=document.createElement("tbody");
  S.pad.forEach(function(p){
    var tr=document.createElement("tr");
    var td1=document.createElement("td");td1.innerHTML='<strong>'+esc(p.nombre)+'</strong>';
    var td2=document.createElement("td");td2.textContent=p.dni;
    var td3=document.createElement("td");td3.innerHTML='<span class="bdg bbrn">'+esc(p.sector)+'</span>';
    var td4=document.createElement("td");
    var btn=document.createElement("button");btn.className="btn brd bsm";btn.textContent="X";
    btn.onclick=(function(dni){return function(){delP(dni);};})(p.dni);
    td4.appendChild(btn);
    tr.appendChild(td1);tr.appendChild(td2);tr.appendChild(td3);tr.appendChild(td4);tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);wrap.appendChild(tbl);
  return wrap.outerHTML;
}

function showAP(){
  var d=document.getElementById("modc");
  d.innerHTML="";
  var hd=document.createElement("div");hd.className="mhd";
  hd.innerHTML='<div class="mtit">Agregar persona</div><button class="cbtn" onclick="cm()">X</button>';
  d.appendChild(hd);
  var gb=document.createElement("div");gb.className="gbar";d.appendChild(gb);
  function addField(lbl,id,type,ph){
    var fg=document.createElement("div");fg.className="fg";
    var l=document.createElement("label");l.className="fl";l.textContent=lbl;
    var inp=document.createElement("input");inp.className="fi";inp.id=id;inp.placeholder=ph;if(type)inp.type=type;
    fg.appendChild(l);fg.appendChild(inp);d.appendChild(fg);
  }
  addField("Nombre y Apellido","nNom","text","Nombre completo");
  addField("DNI","nDni","number","Numero de DNI");
  var fg=document.createElement("div");fg.className="fg";
  var l=document.createElement("label");l.className="fl";l.textContent="Sector";
  var sel=document.createElement("select");sel.className="fs";sel.id="nSec";
  ["","Cocina y Maestranza","Trailer y Flota Pesada","Administracion"].forEach(function(v){
    var o=document.createElement("option");o.value=v;o.textContent=v||"Selecciona...";sel.appendChild(o);
  });
  fg.appendChild(l);fg.appendChild(sel);d.appendChild(fg);
  var btn=document.createElement("button");btn.className="btn bbr";btn.style.width="100%";btn.textContent="Guardar";btn.onclick=saveP;
  d.appendChild(btn);
  document.getElementById("mov").style.display="flex";
}

async function saveP(){
  var n=document.getElementById("nNom").value.trim(),d=document.getElementById("nDni").value.trim(),s=document.getElementById("nSec").value;
  if(!n||!d||!s){alert("Completa todos los campos.");return;}
  if(S.pad.find(function(p){return p.dni===d;})){alert("Ya existe esa persona.");return;}
  sl("Guardando...");
  try{await db.collection("padron").doc(d).set({nombre:n,dni:d,sector:s});S.pad.push({nombre:n,dni:d,sector:s});cm();rPad();}
  catch(ex){alert("Error al guardar.");}finally{hl();}
}

async function delP(dni){
  if(!confirm("Eliminar?"))return;sl("Eliminando...");
  try{await db.collection("padron").doc(dni).delete();S.pad=S.pad.filter(function(p){return p.dni!==dni;});rPad();}
  catch(ex){alert("Error.");}finally{hl();}
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
        try{await db.collection("padron").doc(pts[1]).set({nombre:pts[0],dni:pts[1],sector:pts[2]});S.pad.push({nombre:pts[0],dni:pts[1],sector:pts[2]});added++;}catch(e){}
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

function rACaps(){
  var h='<div class="card"><div class="ctit"><span>Capacitaciones</span><button class="btn bbr bsm" onclick="newCap()">+ Nueva</button></div>';
  h+=rCapsList();
  h+='</div>';
  document.getElementById("cont").innerHTML=h;
}

function rCapsList(){
  if(!S.caps.length)return '<div class="empty"><div class="eico">&#128193;</div><div class="etit">Sin capacitaciones</div></div>';
  var cont=document.createElement("div");
  S.caps.forEach(function(c){
    var card=document.createElement("div");card.className="trc";
    var row=document.createElement("div");row.style.cssText="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px";
    var info=document.createElement("div");info.style.cssText="flex:1;min-width:0";
    var h3=document.createElement("h3");h3.textContent=c.titulo;
    var meta=document.createElement("div");meta.className="tmeta";
    if(c.fileName){var sf=document.createElement("span");sf.textContent=c.fileName;meta.appendChild(sf);}
    var sq=document.createElement("span");sq.textContent=(c.preguntas?c.preguntas.length:0)+" preguntas";meta.appendChild(sq);
    if(c.sectores&&c.sectores.length>0){
      var ss=document.createElement("span");ss.style.cssText="color:#b8860b;font-weight:600";ss.textContent="Sectores: "+c.sectores.join(", ");meta.appendChild(ss);
    }else{
      var ss=document.createElement("span");ss.style.cssText="color:#1a6632;font-weight:600";ss.textContent="Todos los sectores";meta.appendChild(ss);
    }
    info.appendChild(h3);info.appendChild(meta);
    var btns=document.createElement("div");btns.style.cssText="display:flex;gap:6px;flex-shrink:0";
    var eb=document.createElement("button");eb.className="btn bol bsm";eb.textContent="Editar";
    eb.onclick=(function(id){return function(){editCap(id);};})(c.id);
    var db2=document.createElement("button");db2.className="btn brd bsm";db2.textContent="X";
    db2.onclick=(function(id){return function(){delCap(id);};})(c.id);
    btns.appendChild(eb);btns.appendChild(db2);
    row.appendChild(info);row.appendChild(btns);card.appendChild(row);cont.appendChild(card);
  });
  return cont.innerHTML;
}

function newCap(){
  S.ec={titulo:"",fileData:null,fileName:"",fileType:"",preguntas:Array(6).fill(null).map(function(){return{texto:"",opciones:["","",""],respuesta:0};})};
  oCM();
}

function editCap(id){
  var c=S.caps.find(function(x){return x.id===id;});if(!c)return;
  S.ec=JSON.parse(JSON.stringify(c));
  while(S.ec.preguntas.length<6)S.ec.preguntas.push({texto:"",opciones:["","",""],respuesta:0});
  oCM();
}

function oCM(){
  var c=S.ec;
  var d=document.getElementById("modc");
  d.innerHTML="";

  var hd=document.createElement("div");hd.className="mhd";
  hd.innerHTML='<div class="mtit">'+(c.id?"Editar":"Nueva")+' Capacitacion</div><button class="cbtn" onclick="cm()">X</button>';
  d.appendChild(hd);
  var gb=document.createElement("div");gb.className="gbar";d.appendChild(gb);

  var fg1=document.createElement("div");fg1.className="fg";
  var l1=document.createElement("label");l1.className="fl";l1.textContent="Titulo";
  var inp1=document.createElement("input");inp1.className="fi";inp1.id="cTit";inp1.placeholder="Nombre de la capacitacion";inp1.value=c.titulo||"";
  fg1.appendChild(l1);fg1.appendChild(inp1);d.appendChild(fg1);

  var fgSec=document.createElement("div");fgSec.className="fg";
  var lSec=document.createElement("label");lSec.className="fl";lSec.textContent="Sectores destinatarios";
  var secDesc=document.createElement("div");secDesc.style.cssText="font-size:11px;color:#6b5c4e;margin-bottom:8px";secDesc.textContent="Deja todo sin marcar para que sea para todos los sectores.";
  fgSec.appendChild(lSec);fgSec.appendChild(secDesc);
  var sectors=["Cocina y Maestranza","Trailer y Flota Pesada","Administracion"];
  sectors.forEach(function(sec){
    var row=document.createElement("div");row.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:6px";
    var cb=document.createElement("input");cb.type="checkbox";cb.id="sec_"+sec.replace(/ /g,"_");cb.value=sec;cb.style.cssText="width:16px;height:16px;cursor:pointer;accent-color:#b8860b";
    if(c.sectores&&c.sectores.indexOf(sec)>=0)cb.checked=true;
    var lb=document.createElement("label");lb.htmlFor=cb.id;lb.style.cssText="font-size:13px;color:#3a2317;cursor:pointer";lb.textContent=sec;
    row.appendChild(cb);row.appendChild(lb);fgSec.appendChild(row);
  });
  d.appendChild(fgSec);

  var fg2=document.createElement("div");fg2.className="fg";
  var l2=document.createElement("label");l2.className="fl";l2.textContent="Archivo PDF o PowerPoint";
  var drop=document.createElement("div");drop.className="fdrop";drop.onclick=triggerFileInput;
  var ico=document.createElement("div");ico.style.fontSize="28px";ico.style.marginBottom="6px";ico.textContent="\uD83D\uDCC2";
  var lbl=document.createElement("div");lbl.id="fLbl";lbl.style.fontWeight="600";lbl.textContent=c.fileName?"OK: "+c.fileName:"Subir PDF o PPT (max 15MB)";
  var finp=document.createElement("input");finp.type="file";finp.id="fInp";finp.accept=".pdf,.ppt,.pptx";finp.style.display="none";finp.onchange=hFU;
  drop.appendChild(ico);drop.appendChild(lbl);drop.appendChild(finp);
  fg2.appendChild(l2);fg2.appendChild(drop);d.appendChild(fg2);

  var qdiv=document.createElement("div");
  var qlbl=document.createElement("div");qlbl.style.cssText="font-size:12px;font-weight:700;color:#6b5c4e;margin-bottom:10px";qlbl.textContent="6 preguntas de evaluacion";
  qdiv.appendChild(qlbl);
  var qcont=document.createElement("div");qcont.id="qcont";
  c.preguntas.forEach(function(q,qi){
    var qb=document.createElement("div");qb.className="qbox";
    var qn=document.createElement("div");qn.className="qnum";qn.textContent="Pregunta "+(qi+1);
    var qt=document.createElement("input");qt.type="text";qt.id="qt"+qi;qt.value=q.texto||"";qt.placeholder="Escribe la pregunta";
    qb.appendChild(qn);qb.appendChild(qt);
    [0,1,2].forEach(function(oi){
      var or=document.createElement("div");or.className="orow";
      var radio=document.createElement("input");radio.type="radio";radio.name="cr"+qi;radio.value=oi;
      if(q.respuesta===oi)radio.checked=true;
      radio.addEventListener("change",function(){sc(qi,oi);});
      var oinp=document.createElement("input");oinp.type="text";oinp.id="qo"+qi+"i"+oi;oinp.value=q.opciones[oi]||"";oinp.placeholder="Opcion "+(oi+1);
      or.appendChild(radio);or.appendChild(oinp);qb.appendChild(or);
    });
    var hint=document.createElement("div");hint.style.cssText="font-size:11px;color:#a09080;margin-top:4px";hint.textContent="Marca el circulo de la respuesta correcta";
    qb.appendChild(hint);qcont.appendChild(qb);
  });
  qdiv.appendChild(qcont);d.appendChild(qdiv);

  var sbtn=document.createElement("button");sbtn.className="btn bgn";sbtn.style.cssText="width:100%;margin-top:4px";sbtn.textContent="Guardar capacitacion";sbtn.onclick=saveCap;
  d.appendChild(sbtn);
  document.getElementById("mov").style.display="flex";
}

function sc(qi,oi){if(S.ec&&S.ec.preguntas[qi])S.ec.preguntas[qi].respuesta=parseInt(oi);}

function hFU(ev){
  var f=ev.target.files[0];if(!f)return;
  if(f.size>15*1024*1024){alert("Archivo muy grande.");return;}
  document.getElementById("fLbl").textContent="Cargando "+f.name+"...";
  var r=new FileReader();
  r.onload=function(x){S.ec.fileData=x.target.result;S.ec.fileName=f.name;S.ec.fileType=f.type;document.getElementById("fLbl").textContent="OK: "+f.name;};
  r.readAsDataURL(f);
}

async function saveCap(){
  var tit=document.getElementById("cTit").value.trim();
  if(!tit){alert("Ingresa un titulo.");return;}
  var sectors=["Cocina y Maestranza","Trailer y Flota Pesada","Administracion"];
  var selectedSectors=[];
  sectors.forEach(function(sec){
    var cb=document.getElementById("sec_"+sec.replace(/ /g,"_"));
    if(cb&&cb.checked)selectedSectors.push(sec);
  });
  var qs=S.ec.preguntas.map(function(q,qi){
    return{
      texto:document.getElementById("qt"+qi).value.trim()||q.texto,
      opciones:[0,1,2].map(function(oi){return document.getElementById("qo"+qi+"i"+oi).value.trim();}),
      respuesta:q.respuesta
    };
  });
  for(var i=0;i<qs.length;i++){
    if(!qs[i].texto){alert("Completa la pregunta "+(i+1)+".");return;}
    if(qs[i].opciones.some(function(o){return!o;})){alert("Completa las opciones de la pregunta "+(i+1)+".");return;}
  }
  var cap={titulo:tit,fileData:S.ec.fileData||"",fileName:S.ec.fileName||"",fileType:S.ec.fileType||"",preguntas:qs,sectores:selectedSectors,creado:S.ec.creado||new Date().toLocaleDateString("es-AR")};
  if(S.ec.id)cap.id=S.ec.id;
  sl("Guardando...");
  try{
    var id=S.ec.id||("cap_"+Date.now());cap.id=id;
    await db.collection("capacitaciones").doc(id).set(cap);
    if(S.ec.id){var idx=S.caps.findIndex(function(c){return c.id===S.ec.id;});if(idx>=0)S.caps[idx]=cap;}
    else S.caps.push(cap);
    cm();rACaps();
  }catch(ex){alert("Error al guardar.");}finally{hl();}
}

async function delCap(id){
  if(!confirm("Eliminar capacitacion?"))return;sl("Eliminando...");
  try{await db.collection("capacitaciones").doc(id).delete();S.caps=S.caps.filter(function(c){return c.id!==id;});rACaps();}
  catch(ex){alert("Error.");}finally{hl();}
}

function rCump(){
  var tc=S.caps.length,cd=0,pd=0;
  var rows=S.pad.map(function(p){
    var comp=S.caps.filter(function(c){var k=p.dni+"_"+c.id;return S.cump[k]&&S.cump[k].aprobado;}).length;
    var pct=tc>0?Math.round((comp/tc)*100):0;
    if(pct===100)cd++;else pd++;
    return{p:p,comp:comp,pct:pct};
  });
  var h='<div class="sgrid">';
  h+='<div class="sbox"><div class="snum">'+S.pad.length+'</div><div class="slbl">Personal</div></div>';
  h+='<div class="sbox"><div class="snum">'+tc+'</div><div class="slbl">Capacitaciones</div></div>';
  h+='<div class="sbox sgn"><div class="snum">'+cd+'</div><div class="slbl">Completaron todo</div></div>';
  h+='<div class="sbox syl"><div class="snum">'+pd+'</div><div class="slbl">Con pendientes</div></div></div>';
  h+='<div class="card"><div class="ctit"><span>Detalle</span><button class="btn bgn bsm" onclick="expXL()">Exportar Excel</button></div>';
  if(!rows.length){h+='<div class="empty"><div class="eico">&#128203;</div><div class="etit">Sin personal</div></div>';}
  else{
    h+='<div class="twrap"><table><thead><tr><th>Nombre</th><th>DNI</th><th>Sector</th><th>Avance</th><th>Estado</th></tr></thead><tbody>';
    rows.forEach(function(r){
      h+='<tr><td><strong>'+esc(r.p.nombre)+'</strong></td><td>'+esc(r.p.dni)+'</td>';
      h+='<td><span class="bdg bbrn">'+esc(r.p.sector)+'</span></td>';
      h+='<td><div style="min-width:80px"><div style="font-size:11px;color:#6b5c4e;margin-bottom:3px">'+r.comp+'/'+tc+'</div>';
      h+='<div class="pb"><div class="pf'+(r.pct===100?" full":"")+'" style="width:'+r.pct+'%"></div></div></div></td>';
      h+='<td><span class="bdg '+(r.pct===100?"bgn2":r.pct>0?"byl":"brd2")+'">'+(r.pct===100?"Completo":r.pct>0?r.pct+"%":"Pendiente")+'</span></td></tr>';
    });
    h+='</tbody></table></div>';
  }
  h+='</div>';
  S.caps.forEach(function(c){
    var targetPad=S.pad.filter(function(p){
      if(!c.sectores||c.sectores.length===0)return true;
      return c.sectores.indexOf(p.sector)>=0;
    });
    var ap=targetPad.filter(function(p){var k=p.dni+"_"+c.id;return S.cump[k]&&S.cump[k].aprobado;});
    var secLabel=c.sectores&&c.sectores.length>0?c.sectores.join(", "):"Todos los sectores";
    h+='<div class="card"><div class="ctit"><span>'+esc(c.titulo)+'</span><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="bdg bbrn" style="font-size:10px">'+esc(secLabel)+'</span><span class="bdg bbrn">'+ap.length+'/'+targetPad.length+' aprobaron</span></div></div>';
    if(ap.length){
      h+='<div class="twrap"><table><thead><tr><th>Nombre</th><th>Sector</th><th>Nota</th><th>Fecha</th></tr></thead><tbody>';
      ap.forEach(function(p){var cu=S.cump[p.dni+"_"+c.id];h+='<tr><td>'+esc(p.nombre)+'</td><td>'+esc(p.sector)+'</td><td><span class="bdg bgn2">'+cu.nota+'%</span></td><td style="font-size:12px;color:#6b5c4e">'+(cu.fecha||"")+'</td></tr>';});
      h+='</tbody></table></div>';
    }else{h+='<div style="font-size:13px;color:#a09080;padding:8px 0">Nadie aprobo todavia.</div>';}
    h+='</div>';
  });
  document.getElementById("cont").innerHTML=h;
}

function expXL(){
  var tc=S.caps.length;
  var rows=[["Nombre","DNI","Sector","Completadas","Total","Porcentaje","Estado"]];
  S.pad.forEach(function(p){
    var comp=S.caps.filter(function(c){var k=p.dni+"_"+c.id;return S.cump[k]&&S.cump[k].aprobado;}).length;
    var pct=tc>0?Math.round((comp/tc)*100):0;
    rows.push([p.nombre,p.dni,p.sector,comp,tc,pct+"%",pct===100?"Completo":pct>0?"Parcial":"Pendiente"]);
  });
  dCSV(rows,"cumplimiento.csv");
  alert("Exportado!");
}

function rUCaps(){
  var userSector=S.u.sector;
  var filteredCaps=S.caps.filter(function(c){
    if(!c.sectores||c.sectores.length===0)return true;
    return c.sectores.indexOf(userSector)>=0;
  });
  if(!filteredCaps.length){
    document.getElementById("cont").innerHTML='<div class="card"><div class="empty"><div class="eico">&#128218;</div><div class="etit">Sin capacitaciones disponibles</div><p>El administrador aun no cargo capacitaciones para tu sector.</p></div></div>';
    return;
  }
  var h='<div class="card"><div class="ctit">Capacitaciones disponibles</div>';
  var cont=document.getElementById("cont");
  cont.innerHTML=h;
  filteredCaps.forEach(function(c){
    var key=S.u.dni+"_"+c.id,cu=S.cump[key],ap=!!(cu&&cu.aprobado);
    var card=document.createElement("div");card.className="trc";
    card.onclick=(function(id){return function(){verCap(id);};})(c.id);
    var row=document.createElement("div");row.style.cssText="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px";
    var info=document.createElement("div");info.style.cssText="flex:1;min-width:0";
    var h3=document.createElement("h3");h3.textContent=c.titulo;
    var meta=document.createElement("div");meta.className="tmeta";
    if(c.fileName){var sf=document.createElement("span");sf.textContent=c.fileName;meta.appendChild(sf);}
    var sq=document.createElement("span");sq.textContent=c.preguntas.length+" preguntas";meta.appendChild(sq);
    info.appendChild(h3);info.appendChild(meta);
    var bdg=document.createElement("span");bdg.className="bdg "+(ap?"bgn2":"byl");bdg.textContent=ap?"Aprobada "+cu.nota+"%":"Pendiente";
    row.appendChild(info);row.appendChild(bdg);card.appendChild(row);cont.querySelector(".card").appendChild(card);
  });
}

function verCap(id){
  var c=S.caps.find(function(x){return x.id===id;});if(!c)return;
  var key=S.u.dni+"_"+c.id,cu=S.cump[key],ap=!!(cu&&cu.aprobado);
  var d=document.getElementById("modc");d.innerHTML="";
  var hd=document.createElement("div");hd.className="mhd";
  hd.innerHTML='<div class="mtit">'+esc(c.titulo)+'</div><button class="cbtn" onclick="cm()">X</button>';
  d.appendChild(hd);
  var gb=document.createElement("div");gb.className="gbar";d.appendChild(gb);
  if(c.fileData){
    var fdiv=document.createElement("div");fdiv.style.marginBottom="16px";
    var ftit=document.createElement("div");ftit.style.cssText="font-size:12px;font-weight:700;color:#6b5c4e;margin-bottom:8px";
    if(c.fileType&&c.fileType.indexOf("pdf")>=0){
      ftit.textContent="CONTENIDO DEL CURSO";
      var fw=document.createElement("div");fw.style.cssText="background:#f5f2ee;border:1px solid #e0d8cc;border-radius:8px;overflow:hidden";
      var emb=document.createElement("embed");emb.src=c.fileData;emb.type="application/pdf";emb.width="100%";emb.height="480px";emb.style.display="block";
      fw.appendChild(emb);fdiv.appendChild(ftit);fdiv.appendChild(fw);
    }else{
      ftit.textContent="MATERIAL DE ESTUDIO";
      var fw=document.createElement("div");fw.style.cssText="background:#faf3e8;border:1px solid #e0d8cc;border-radius:8px;padding:20px;text-align:center";
      var fn=document.createElement("div");fn.style.cssText="font-size:14px;font-weight:600;color:#3a2317;margin-bottom:14px";fn.textContent=c.fileName;
      var dl=document.createElement("a");dl.href=c.fileData;dl.download=c.fileName;dl.style.cssText="display:inline-block;padding:10px 20px;background:#3a2317;color:white;border-radius:7px;font-size:13px;font-weight:700;text-decoration:none";dl.textContent="Descargar";
      fw.appendChild(fn);fw.appendChild(dl);fdiv.appendChild(ftit);fdiv.appendChild(fw);
    }
    d.appendChild(fdiv);
  }
  if(ap){
    var ab=document.createElement("div");ab.className="apbanner";
    ab.innerHTML='<div style="font-size:28px;margin-bottom:4px">&#127891;</div><div style="font-weight:800;color:#1a6632">Capacitacion aprobada!</div><div style="font-size:12px;color:#2d6e44;margin-top:3px">Nota: '+cu.nota+'% - '+cu.fecha+'</div>';
    d.appendChild(ab);
  }else{
    var rbtn=document.createElement("button");rbtn.className="btn bbr";rbtn.style.cssText="width:100%;padding:13px;font-size:15px";rbtn.textContent="Rendir evaluacion";
    var cid=c.id;rbtn.onclick=function(){startQ(cid);};
    d.appendChild(rbtn);
    var hint=document.createElement("div");hint.style.cssText="font-size:12px;color:#6b5c4e;text-align:center;margin-top:8px";hint.textContent="Se necesita 70% o mas para aprobar";
    d.appendChild(hint);
  }
  document.getElementById("mov").style.display="flex";
}

function startQ(id){
  var c=S.caps.find(function(x){return x.id===id;});if(!c)return;
  S.quiz={id:c.id,preguntas:c.preguntas,resp:Array(c.preguntas.length).fill(null),step:0};
  rQ();
}

function rQ(){
  var q=S.quiz,p=q.preguntas[q.step],sel=q.resp[q.step],L=["A","B","C"];
  var d=document.getElementById("modc");d.innerHTML="";
  var hd=document.createElement("div");hd.className="mhd";
  hd.innerHTML='<div class="mtit">Evaluacion - '+(q.step+1)+' de '+q.preguntas.length+'</div><button class="cbtn" onclick="cm()">X</button>';
  d.appendChild(hd);
  var gb=document.createElement("div");gb.className="gbar";d.appendChild(gb);
  var pb=document.createElement("div");pb.className="pb";pb.style.cssText="margin-bottom:20px;height:6px";
  var pf=document.createElement("div");pf.className="pf";pf.style.width=Math.round(((q.step+1)/q.preguntas.length)*100)+"%";
  pb.appendChild(pf);d.appendChild(pb);
  var qt=document.createElement("div");qt.style.cssText="font-size:15px;font-weight:700;color:#3a2317;margin-bottom:18px;line-height:1.45";qt.textContent=p.texto;
  d.appendChild(qt);
  p.opciones.forEach(function(op,oi){
    var opt=document.createElement("div");opt.className="qo"+(sel===oi?" sel":"");
    var ltr=document.createElement("div");ltr.className="ql";ltr.textContent=L[oi];
    var txt=document.createElement("span");txt.textContent=op;
    opt.appendChild(ltr);opt.appendChild(txt);
    opt.onclick=function(){sa(oi);};
    d.appendChild(opt);
  });
  var btnrow=document.createElement("div");btnrow.style.cssText="display:flex;gap:10px;margin-top:18px";
  if(q.step>0){var pb2=document.createElement("button");pb2.className="btn bol";pb2.textContent="Anterior";pb2.onclick=qP;btnrow.appendChild(pb2);}
  if(q.step<q.preguntas.length-1){
    var nb=document.createElement("button");nb.className="btn bbr";nb.style.flex="1";nb.textContent="Siguiente";if(sel===null)nb.disabled=true;nb.onclick=qN;btnrow.appendChild(nb);
  }else{
    var fb=document.createElement("button");fb.className="btn bgn";fb.style.flex="1";fb.textContent="Finalizar";if(sel===null)fb.disabled=true;fb.onclick=subQ;btnrow.appendChild(fb);
  }
  d.appendChild(btnrow);
  document.getElementById("mov").style.display="flex";
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
  var d=document.getElementById("modc");d.innerHTML="";
  var rs=document.createElement("div");rs.style.cssText="text-align:center;padding:20px 10px";
  var ico=document.createElement("div");ico.style.cssText="font-size:60px;margin-bottom:12px";ico.textContent=ap?"\uD83C\uDF89":"\uD83D\uDE14";
  var sc=document.createElement("div");sc.style.cssText="font-size:52px;font-weight:900;margin-bottom:6px;color:"+(ap?"#1a6632":"#8b1a1a");sc.textContent=nota+"%";
  var tl=document.createElement("div");tl.style.cssText="font-size:18px;font-weight:800;margin-bottom:10px;color:"+(ap?"#1a6632":"#8b1a1a");tl.textContent=ap?"Aprobado!":"No aprobado";
  var msg=document.createElement("div");msg.style.cssText="font-size:14px;color:#6b5c4e;line-height:1.5";msg.textContent=cor+" respuestas correctas de "+q.preguntas.length+". "+(ap?"Capacitacion completada!":"Se necesita 70% para aprobar.");
  var br=document.createElement("div");br.style.cssText="margin-top:22px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap";
  if(!ap){var rb=document.createElement("button");rb.className="btn bol";rb.textContent="Intentar de nuevo";var qid=q.id;rb.onclick=function(){startQ(qid);};br.appendChild(rb);}
  var vb=document.createElement("button");vb.className="btn bbr";vb.textContent="Volver";vb.onclick=function(){cm();rUCaps();};br.appendChild(vb);
  rs.appendChild(ico);rs.appendChild(sc);rs.appendChild(tl);rs.appendChild(msg);rs.appendChild(br);
  d.appendChild(rs);
  document.getElementById("mov").style.display="flex";
}

function rLogros(){
  var u=S.u;
  var userSector=u.sector;
  var filteredCaps=S.caps.filter(function(c){
    if(!c.sectores||c.sectores.length===0)return true;
    return c.sectores.indexOf(userSector)>=0;
  });
  var caps=filteredCaps.map(function(c){var key=u.dni+"_"+c.id,cu=S.cump[key];return{c:c,cu:cu,ap:!!(cu&&cu.aprobado)};});
  var apd=caps.filter(function(x){return x.ap;}),pend=caps.filter(function(x){return!x.ap;});
  var pct=filteredCaps.length>0?Math.round((apd.length/filteredCaps.length)*100):0;
  var h='<div class="card" style="text-align:center;padding:22px">';
  h+='<div style="font-size:13px;color:#6b5c4e;font-weight:600;margin-bottom:6px">TU PROGRESO</div>';
  h+='<div style="font-size:50px;font-weight:900;color:'+(pct===100?"#1a6632":"#3a2317")+'">'+pct+'%</div>';
  h+='<div class="pb" style="margin:14px 0;height:10px"><div class="pf'+(pct===100?" full":"")+'" style="width:'+pct+'%"></div></div>';
  h+='<div style="font-size:13px;color:#6b5c4e">'+apd.length+' de '+filteredCaps.length+' completadas</div>';
  if(pct===100)h+='<div style="margin-top:10px;font-size:13px;font-weight:700;color:#1a6632">Completaste todas las capacitaciones!</div>';
  h+='</div>';
  if(apd.length){
    h+='<div class="card"><div class="ctit">Aprobadas</div>';
    apd.forEach(function(x){
      h+='<div class="trc" style="cursor:default;border-color:#a8d5b5;background:#f6fbf8">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
      h+='<div><h3 style="color:#1a6632">'+esc(x.c.titulo)+'</h3>';
      h+='<div class="tmeta"><span>Nota: '+x.cu.nota+'%</span><span>'+(x.cu.fecha||"")+'</span></div></div>';
      h+='<span class="bdg bgn2">Aprobada</span></div></div>';
    });
    h+='</div>';
  }
  if(pend.length){
    h+='<div class="card"><div class="ctit">Pendientes</div>';
    var pendCont=document.createElement("div");pendCont.className="card";
    var pendTit=document.createElement("div");pendTit.className="ctit";pendTit.textContent="Pendientes";pendCont.appendChild(pendTit);
    pend.forEach(function(x){
      var card=document.createElement("div");card.className="trc";
      card.onclick=(function(id){return function(){verCap(id);};})(x.c.id);
      var row=document.createElement("div");row.style.cssText="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px";
      var info=document.createElement("div");
      var h3=document.createElement("h3");h3.textContent=x.c.titulo;
      var meta=document.createElement("div");meta.className="tmeta";
      var sp=document.createElement("span");sp.textContent="Toca para ver y rendir";meta.appendChild(sp);
      info.appendChild(h3);info.appendChild(meta);
      var bdg=document.createElement("span");bdg.className="bdg byl";bdg.textContent="Pendiente";
      row.appendChild(info);row.appendChild(bdg);card.appendChild(row);pendCont.appendChild(card);
    });
    document.getElementById("cont").appendChild(pendCont);
  }
  if(!S.caps.length)h+='<div class="card"><div class="empty"><div class="eico">&#128237;</div><div class="etit">Sin capacitaciones aun</div></div></div>';
  document.getElementById("cont").innerHTML=h;
}

function dCSV(rows,fn){
  var lines=[];
  rows.forEach(function(r){
    var cells=r.map(function(c){return '"'+String(c).replace(/"/g,"''")+'"';});
    lines.push(cells.join(","));
  });
  var blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});
  var url=URL.createObjectURL(blob);
  var a=document.createElement("a");
  a.href=url;a.download=fn;a.click();
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
}

loadS().then(function(){
  hl();
  document.getElementById("loginScreen").style.display="flex";
}).catch(function(ex){
  console.error(ex);
  document.getElementById("lmsg").textContent="Error al conectar. Recarga la pagina.";
});
