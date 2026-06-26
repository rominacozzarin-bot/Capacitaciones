
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
  var h='<div class="twrap"><table><thead><tr><th>Nombre</th><th>DNI</th><th>Sector</th><th></th></tr></thead><tbody>';
  S.pad.forEach(function(p){
    h+='<tr><td><strong>'+esc(p.nombre)+'</strong></td><td>'+esc(p.dni)+'</td>';
    h+='<td><span class="bdg bbrn">'+esc(p.sector)+'</span></td>';
    h+='<td><button class="btn brd bsm" onclick="delP('+JSON.stringify(p.dni)+')">X</button></td></tr>';
  });
  h+='</tbody></table></div>';
  return h;
}

function showAP(){
  var h='<div class="mhd"><div class="mtit">Agregar persona</div><button class="cbtn" onclick="cm()">X</button></div>';
  h+='<div class="gbar"></div>';
  h+='<div class="fg"><label class="fl">Nombre y Apellido</label><input class="fi" id="nNom" placeholder="Nombre completo"></div>';
  h+='<div class="fg"><label class="fl">DNI</label><input class="fi" id="nDni" type="number" placeholder="Numero de DNI"></div>';
  h+='<div class="fg"><label class="fl">Sector</label><select class="fs" id="nSec"><option value="">Selecciona...</option><option>Cocina y Maestranza</option><option>Trailer y Flota Pesada</option><option>Administracion</option></select></div>';
  h+='<button class="btn bbr" style="width:100%" onclick="saveP()">Guardar</button>';
  om(h);
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
  var h="";
  S.caps.forEach(function(c){
    h+='<div class="trc">';
    h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">';
    h+='<div style="flex:1;min-width:0"><h3>'+esc(c.titulo)+'</h3>';
    h+='<div class="tmeta">';
    if(c.fileName)h+='<span>'+esc(c.fileName)+'</span>';
    h+='<span>'+(c.preguntas?c.preguntas.length:0)+' preguntas</span></div></div>';
    h+='<div style="display:flex;gap:6px;flex-shrink:0">';
    h+='<button class="btn bol bsm" onclick="editCap('+JSON.stringify(c.id)+')">Editar</button>';
    h+='<button class="btn brd bsm" onclick="delCap('+JSON.stringify(c.id)+')">X</button>';
    h+='</div></div></div>';
  });
  return h;
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
  var h='<div class="mhd"><div class="mtit">'+(c.id?"Editar":"Nueva")+' Capacitacion</div><button class="cbtn" onclick="cm()">X</button></div>';
  h+='<div class="gbar"></div>';
  h+='<div class="fg"><label class="fl">Titulo</label><input class="fi" id="cTit" value="'+esc(c.titulo||"")+'" placeholder="Nombre de la capacitacion"></div>';
  h+='<div class="fg"><label class="fl">Archivo PDF o PowerPoint</label>';
  h+='<div class="fdrop" onclick="document.getElementById('fInp').click()">';
  h+='<div style="font-size:28px;margin-bottom:6px">&#128194;</div>';
  h+='<div id="fLbl" style="font-weight:600">'+(c.fileName?"OK: "+esc(c.fileName):"Subir PDF o PPT (max 15MB)")+'</div>';
  h+='<input type="file" id="fInp" accept=".pdf,.ppt,.pptx" onchange="hFU(event)"></div></div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:#6b5c4e;margin-bottom:10px">6 preguntas de evaluacion</div><div id="qcont">';
  c.preguntas.forEach(function(q,qi){
    h+='<div class="qbox"><div class="qnum">Pregunta '+(qi+1)+'</div>';
    h+='<input type="text" id="qt'+qi+'" value="'+esc(q.texto||"")+'" placeholder="Escribe la pregunta">';
    [0,1,2].forEach(function(oi){
      h+='<div class="orow"><input type="radio" name="cr'+qi+'" value="'+oi+'"'+(q.respuesta===oi?' checked':'')+' onchange="sc('+qi+','+oi+')">';
      h+='<input type="text" id="qo'+qi+'i'+oi+'" value="'+esc(q.opciones[oi]||"")+'" placeholder="Opcion '+(oi+1)+'"></div>';
    });
    h+='<div style="font-size:11px;color:#a09080;margin-top:4px">Marca el circulo de la respuesta correcta</div></div>';
  });
  h+='</div></div>';
  h+='<button class="btn bgn" style="width:100%;margin-top:4px" onclick="saveCap()">Guardar capacitacion</button>';
  om(h);
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
  var cap={titulo:tit,fileData:S.ec.fileData||"",fileName:S.ec.fileName||"",fileType:S.ec.fileType||"",preguntas:qs,creado:S.ec.creado||new Date().toLocaleDateString("es-AR")};
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
    var ap=S.pad.filter(function(p){var k=p.dni+"_"+c.id;return S.cump[k]&&S.cump[k].aprobado;});
    h+='<div class="card"><div class="ctit"><span>'+esc(c.titulo)+'</span><span class="bdg bbrn">'+ap.length+'/'+S.pad.length+' aprobaron</span></div>';
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
  if(!S.caps.length){
    document.getElementById("cont").innerHTML='<div class="card"><div class="empty"><div class="eico">&#128218;</div><div class="etit">Sin capacitaciones disponibles</div><p>El administrador aun no cargo capacitaciones.</p></div></div>';
    return;
  }
  var h='<div class="card"><div class="ctit">Capacitaciones disponibles</div>';
  S.caps.forEach(function(c){
    var key=S.u.dni+"_"+c.id,cu=S.cump[key],ap=!!(cu&&cu.aprobado);
    h+='<div class="trc" onclick="verCap('+JSON.stringify(c.id)+')">';
    h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">';
    h+='<div style="flex:1;min-width:0"><h3>'+esc(c.titulo)+'</h3>';
    h+='<div class="tmeta">';
    if(c.fileName)h+='<span>'+esc(c.fileName)+'</span>';
    h+='<span>'+c.preguntas.length+' preguntas</span></div></div>';
    h+='<span class="bdg '+(ap?"bgn2":"byl")+'">'+(ap?"Aprobada "+cu.nota+"%":"Pendiente")+'</span>';
    h+='</div></div>';
  });
  h+='</div>';
  document.getElementById("cont").innerHTML=h;
}

function verCap(id){
  var c=S.caps.find(function(x){return x.id===id;});if(!c)return;
  var key=S.u.dni+"_"+c.id,cu=S.cump[key],ap=!!(cu&&cu.aprobado);
  var h='<div class="mhd"><div class="mtit">'+esc(c.titulo)+'</div><button class="cbtn" onclick="cm()">X</button></div>';
  h+='<div class="gbar"></div>';
  if(c.fileData){
    if(c.fileType&&c.fileType.indexOf("pdf")>=0){
      h+='<div style="margin-bottom:16px"><div style="font-size:12px;font-weight:700;color:#6b5c4e;margin-bottom:8px">CONTENIDO DEL CURSO</div>';
      h+='<div style="background:#f5f2ee;border:1px solid #e0d8cc;border-radius:8px;overflow:hidden">';
      h+='<embed src="'+c.fileData+'" type="application/pdf" width="100%" height="480px" style="display:block"></div></div>';
    }else{
      h+='<div style="margin-bottom:16px"><div style="font-size:12px;font-weight:700;color:#6b5c4e;margin-bottom:8px">MATERIAL DE ESTUDIO</div>';
      h+='<div style="background:#faf3e8;border:1px solid #e0d8cc;border-radius:8px;padding:20px;text-align:center">';
      h+='<div style="font-size:14px;font-weight:600;color:#3a2317;margin-bottom:14px">'+esc(c.fileName)+'</div>';
      h+='<a href="'+c.fileData+'" download="'+esc(c.fileName)+'" style="display:inline-block;padding:10px 20px;background:#3a2317;color:white;border-radius:7px;font-size:13px;font-weight:700;text-decoration:none">Descargar</a>';
      h+='</div></div>';
    }
  }else{
    h+='<div style="background:#f0f4f8;border-radius:8px;padding:20px;text-align:center;color:#a0aec0;margin-bottom:16px">Sin archivo adjunto</div>';
  }
  if(ap){
    h+='<div class="apbanner"><div style="font-size:28px;margin-bottom:4px">&#127891;</div>';
    h+='<div style="font-weight:800;color:#1a6632">Capacitacion aprobada!</div>';
    h+='<div style="font-size:12px;color:#2d6e44;margin-top:3px">Nota: '+cu.nota+'% - '+cu.fecha+'</div></div>';
  }else{
    h+='<button class="btn bbr" style="width:100%;padding:13px;font-size:15px" onclick="startQ('+JSON.stringify(c.id)+')">Rendir evaluacion</button>';
    h+='<div style="font-size:12px;color:#6b5c4e;text-align:center;margin-top:8px">Se necesita 70% o mas para aprobar</div>';
  }
  om(h);
}

function startQ(id){
  var c=S.caps.find(function(x){return x.id===id;});if(!c)return;
  S.quiz={id:c.id,preguntas:c.preguntas,resp:Array(c.preguntas.length).fill(null),step:0};
  rQ();
}

function rQ(){
  var q=S.quiz,p=q.preguntas[q.step],sel=q.resp[q.step],L=["A","B","C"];
  var h='<div class="mhd"><div class="mtit">Evaluacion - '+(q.step+1)+' de '+q.preguntas.length+'</div><button class="cbtn" onclick="cm()">X</button></div>';
  h+='<div class="gbar"></div>';
  h+='<div class="pb" style="margin-bottom:20px;height:6px"><div class="pf" style="width:'+Math.round(((q.step+1)/q.preguntas.length)*100)+'%"></div></div>';
  h+='<div style="font-size:15px;font-weight:700;color:#3a2317;margin-bottom:18px;line-height:1.45">'+esc(p.texto)+'</div>';
  p.opciones.forEach(function(op,oi){
    h+='<div class="qo'+(sel===oi?" sel":"")+'" onclick="sa('+oi+')">';
    h+='<div class="ql">'+L[oi]+'</div><span>'+esc(op)+'</span></div>';
  });
  h+='<div style="display:flex;gap:10px;margin-top:18px">';
  if(q.step>0)h+='<button class="btn bol" onclick="qP()">Anterior</button>';
  if(q.step<q.preguntas.length-1){
    h+='<button class="btn bbr" style="flex:1" onclick="qN()"'+(sel===null?' disabled':'')+'>Siguiente</button>';
  }else{
    h+='<button class="btn bgn" style="flex:1" onclick="subQ()"'+(sel===null?' disabled':'')+'>Finalizar</button>';
  }
  h+='</div>';
  om(h);
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
  var h='<div style="text-align:center;padding:20px 10px">';
  h+='<div style="font-size:60px;margin-bottom:12px">'+(ap?"&#127881;":"&#128532;")+'</div>';
  h+='<div style="font-size:52px;font-weight:900;margin-bottom:6px;color:'+(ap?"#1a6632":"#8b1a1a")+'">'+nota+'%</div>';
  h+='<div style="font-size:18px;font-weight:800;margin-bottom:10px;color:'+(ap?"#1a6632":"#8b1a1a")+'">'+(ap?"Aprobado!":"No aprobado")+'</div>';
  h+='<div style="font-size:14px;color:#6b5c4e;line-height:1.5">'+cor+' respuestas correctas de '+q.preguntas.length+'. ';
  h+=(ap?"Capacitacion completada!":"Se necesita 70% para aprobar.")+'</div>';
  h+='<div style="margin-top:22px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">';
  if(!ap)h+='<button class="btn bol" onclick="startQ('+JSON.stringify(q.id)+')">Intentar de nuevo</button>';
  h+='<button class="btn bbr" onclick="cm();rUCaps()">Volver</button></div></div>';
  om(h);
}

function rLogros(){
  var u=S.u;
  var caps=S.caps.map(function(c){var key=u.dni+"_"+c.id,cu=S.cump[key];return{c:c,cu:cu,ap:!!(cu&&cu.aprobado)};});
  var apd=caps.filter(function(x){return x.ap;}),pend=caps.filter(function(x){return!x.ap;});
  var pct=S.caps.length>0?Math.round((apd.length/S.caps.length)*100):0;
  var h='<div class="card" style="text-align:center;padding:22px">';
  h+='<div style="font-size:13px;color:#6b5c4e;font-weight:600;margin-bottom:6px">TU PROGRESO</div>';
  h+='<div style="font-size:50px;font-weight:900;color:'+(pct===100?"#1a6632":"#3a2317")+'">'+pct+'%</div>';
  h+='<div class="pb" style="margin:14px 0;height:10px"><div class="pf'+(pct===100?" full":"")+'" style="width:'+pct+'%"></div></div>';
  h+='<div style="font-size:13px;color:#6b5c4e">'+apd.length+' de '+S.caps.length+' completadas</div>';
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
    pend.forEach(function(x){
      h+='<div class="trc" onclick="verCap('+JSON.stringify(x.c.id)+')">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
      h+='<div><h3>'+esc(x.c.titulo)+'</h3>';
      h+='<div class="tmeta"><span>Toca para ver y rendir</span></div></div>';
      h+='<span class="bdg byl">Pendiente</span></div></div>';
    });
    h+='</div>';
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
