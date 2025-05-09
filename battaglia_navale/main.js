const zonaGriglie = document.querySelector("#zona_griglie");
const zonaNavi = document.querySelector(".zona_navi");
const bottoneRuota = document.querySelector("#bottone_ruota");
const bottoneInizio = document.querySelector("#bottone_inizio");
const bottoneMusica = document.querySelector("#bottone_musica");
const bottoneSalvataggio = document.querySelector("#salvataggio");
const bottoneRandom = document.querySelector("#bottone_random");
const bottoneMenu = document.querySelector("#menu");
const bottoneImpostazioni = document.querySelector("#impostazioni");
const zonaBottoni = document.querySelector("#zona_bottoni");
const info = document.querySelector("#info");
const infoTurno = document.querySelector("#turno");

const SVittoria = new Audio('audio/vittoria.wav');
const SSconfitta = new Audio('audio/sconfitta.wav');
const SColpo = new Audio('audio/colpo.mp3');
const SAffonda = new Audio('audio/affondo.mp3');  
const SBottone = new Audio('audio/bottone.mp3');
const SPluff = new Audio('audio/pluff.mp3');
const Musica = new Audio('audio/musica.mp3');

let isBlitz = false;
if(localStorage.getItem("volume") === null || localStorage.getItem("colori") === null){
    localStorage.setItem("volume", 0.5);
    let  Bcolori= {
        "sottomarino" : "#F5F5F5",
        "cacciatorpediniere":"#008000",
        "corazzata": "#FFFF00",
        "portaerei": "#A52A2A",
    };
    let JBcolori = JSON.stringify(Bcolori);
    localStorage.setItem("colori", JBcolori);
}
let griglia1 =[];
let griglia2 =[];
if(localStorage.getItem("griglia1") !== null){
    let Jgriglia1 = localStorage.getItem("griglia1")
    let Jgriglia2 =localStorage.getItem("griglia2")
    griglia1 = JSON.parse(Jgriglia1);
    griglia2 = JSON.parse(Jgriglia2);
}



let Jcolori = localStorage.getItem("colori");
let colori = JSON.parse(Jcolori);
let volume = localStorage.getItem("volume");
SVittoria.volume = volume;
SSconfitta.volume = volume;
SColpo.volume = volume;
SAffonda.volume = volume;
SBottone.volume = volume;
SPluff.volume = volume;
Musica.volume = volume;


Musica.loop= true;
function musica(){
    if(Musica.currentTime === 0){
        Musica.play();
    }else{
        Musica.pause();
        Musica.currentTime = 0;
    }
    
}
bottoneRuota.addEventListener("click", ruota);
bottoneMusica.addEventListener("click",musica);
bottoneSalvataggio.addEventListener("click",salva);
bottoneMenu.addEventListener("click",salva);
bottoneRandom.addEventListener("click",casuali);
bottoneImpostazioni.addEventListener("click",impostazioni);

let angolo = 0
function ruota(){
    const navi = Array.from(zonaNavi.children);
    angolo= angolo === 0 ? 90 : 0;
    navi.forEach(nave => nave.style.transform = `rotate(${angolo}deg)`);
    SBottone.play();
}

const lato = 10;

function disegnaGriglia(colore, giocatore){
    const griglia= document.createElement('div');
    griglia.classList.add("griglia");
    griglia.style.backgroundColor= colore;
    griglia.id= giocatore;
    zonaGriglie.append(griglia);
    if(griglia1.length === 0){
        for (let i = 0; i < lato*lato; i++){	
            const cella = document.createElement('div');
            cella.classList.add("cella");
            cella.id = i;
            griglia.append(cella);
        }
    }else{
        if(giocatore == "g1"){
            for(let i = 0; i < lato*lato; i++){	
                const cella = document.createElement('div');
                cella.className =griglia1[i][0];
                cella.style.backgroundColor = griglia1[i][1];
                cella.id = i;
                griglia.append(cella);
            }
        }else{
            for(let i = 0; i < lato*lato; i++){	
                const cella = document.createElement('div');
                cella.className =griglia2[i][0];
                cella.style.backgroundColor = griglia2[i][1];
                cella.id = i;
                griglia.append(cella);
            }
        }
    }
}
disegnaGriglia("blue", "g1");
disegnaGriglia("blue", "g2");


class nave{
    constructor(nome, lunghezza){
        this.nome = nome;
        this.lunghezza = lunghezza;
    }

}
const sottomarino = new nave("sottomarino", 1);
const cacciatorpediniere = new nave("cacciatorpediniere", 2);
const corazzata = new nave("corazzata", 3);
const portaerei = new nave("portaerei", 4);

const navi = [portaerei,corazzata,cacciatorpediniere,sottomarino];
let nonDroppata


function celle_nave(orizzontale, celle, indice,nave){
    let celleNave = [];
    for(let i=0; i < nave.lunghezza; i++){
        if(orizzontale){
            celleNave.push(celle[Number(indice)+i]);
        }else{
            celleNave.push(celle[Number(indice)+i*lato]);
        }
    }
    return celleNave;
}

function controllo_posizione(orizzontale, indice,nave, celle){
    let celleNave= celle_nave(orizzontale, celle, indice,nave);
    if(orizzontale){
        if((indice %10) + nave.lunghezza > lato)
            return false; 
    }else{
        if(Math.floor(indice / 10) + nave.lunghezza > lato)
            return false;  
    }
    const libero = (celleNave.every(cella => !cella.classList.contains('occupato',))) && (celleNave.every(cella => !cella.classList.contains('adiacente',)));
    if(libero){
        return true;
    }else{
        return false;
    }
}

let n = 0;
function aggiunginavi(nave, user,cella){
    const celle = document.querySelectorAll(`#${user} div`);
    let booleanoCasuale = Math.random() < 0.5;
    let orizzontale = user === "g2" ? booleanoCasuale : angolo === 0;
    let randomindice = Math.floor(Math.random()*lato*lato);
    let indice = typeof cella !== "undefined" ? cella : randomindice;
    if(controllo_posizione(orizzontale, indice,nave,celle)){
        let celleadiacenti = adiacenti(celle,indice,nave,orizzontale);
        let celleNave= celle_nave(orizzontale, celle, indice,nave);
        celleNave.forEach(cella => {
            cella.classList.add(nave.nome);
            cella.style.backgroundColor=colori[nave.nome];
            cella.classList.add("occupato");
            })
        if(user === "g2"){
            celleNave.forEach(cella =>{
                cella.classList.add(nave.nome + n)
                cella.style.backgroundColor="blue";
            });
            n++;
        } 
        celleadiacenti.forEach(cella => {
            try{
                cella.classList.add("adiacente");
            }catch{}     
            })
    }else{
        if(typeof cella === "undefined") aggiunginavi(nave, user, cella);
        else nonDroppata = true;
    }
}

function adiacenti(celle,indice,nave,orizzontale){
    let celleadiacenti = []
    let indiceAttuale = -1
    if(orizzontale){
        let indiceinizio = indice-1;
        for(let i=0; i < nave.lunghezza+2; i++){
            indiceAttuale = indiceinizio-lato+i;
            if(Math.floor(indiceAttuale/10) === Math.floor((indice-lato)/10))
                celleadiacenti.push(celle[Number(indiceAttuale)]);
        }
        for(let i=0; i < nave.lunghezza+2; i++){
            indiceAttuale = indiceinizio+lato+i;
            if(Math.floor(indiceAttuale/10) === Math.floor((indice+lato)/10))
                celleadiacenti.push(celle[Number(indiceAttuale)]);
        }
        if(Math.floor(indiceinizio/10) === Math.floor(indice/10))
            celleadiacenti.push(celle[Number(indiceinizio)]);
        if(Math.floor((indice+ nave.lunghezza)/10) === Math.floor(indice/10))
            celleadiacenti.push(celle[Number(indice+ nave.lunghezza)]);
    }else{
        let indiceinizio = indice -lato
        if(indice%lato !== 0){
            for(let i=0; i < nave.lunghezza+2; i++){
                indiceAttuale = indiceinizio-1+i*lato;
                celleadiacenti.push(celle[Number(indiceAttuale)]);
            }
        }
        if(indice%lato !== 9){
            for(let i=0; i < nave.lunghezza+2; i++){
                indiceAttuale = indiceinizio+1+i*lato;
                celleadiacenti.push(celle[Number(indiceAttuale)]);
            }
        }
        celleadiacenti.push(celle[Number(indiceinizio)]);
        celleadiacenti.push(celle[Number(indice+ nave.lunghezza*lato)]);
    }

    return celleadiacenti;

}

if(griglia1.length === 0){
    for(let i=0; i < navi.length; i++){
        for(let j=5; j > navi[i].lunghezza; j--){
            aggiunginavi(navi[i],"g2");
        }
    }
}


let naveDraggata;
const navim = Array.from(zonaNavi.children);
navim.forEach(nave => nave.addEventListener("dragstart", dragStart));





const celleG1 =  document.querySelectorAll("#g1 div");
celleG1.forEach(cella => {
    cella.addEventListener("dragover", dragOver);
    cella.addEventListener("drop", drop);
})
let rect; 
let x;
let y;
function dragStart(e){
    naveDraggata = e.target;
    nonDroppata = false;
    rect = e.target.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
}
let oldidcella=1;
function dragOver(e){
    e.preventDefault();
    let idcella;
    if(angolo === 0)
        idcella = (e.target.id) - Math.floor(x/30);
    else
        idcella = e.target.id-(Math.floor(y/30)*lato);
    const nave = navi[naveDraggata.id];
    if(oldidcella !==idcella){
        nascondi(oldidcella, nave);
        evidenzia(idcella, nave);     
        oldidcella= idcella;
    }    
}
function drop(e){
    let idcella;
    if(angolo === 0)
        idcella = (e.target.id) - Math.floor(x/30);
    else
        idcella = e.target.id-(Math.floor(y/30)*lato);
    const nave = navi[naveDraggata.id];
    aggiunginavi(nave,"g1", idcella);
    if(!nonDroppata){
        naveDraggata.remove();
    }
    oldidcella=0
    nascondi(idcella, nave)
    naveDraggata = 0;
}



function evidenzia(indice, nave){
    const celle = document.querySelectorAll("#g1 div");
    let orizzontale = angolo === 0;
    let celleNave = celle_nave(orizzontale, celle, indice, nave);
    if(controllo_posizione(orizzontale, indice, nave, celle)){
        celleNave.forEach(cella => cella.classList.add("evidenziata"));
    }

}
function nascondi(indice, nave){
    const celle = document.querySelectorAll("#g1 div");
    let orizzontale = angolo === 0;
    let celleNave = celle_nave(orizzontale, celle, indice, nave);
    try{
        celleNave.forEach(cella => cella.classList.remove("evidenziata"));  
    }catch{
    }
     
}

let gameOver= false;
let turnoplayer = 0;
let turno;

let naviColpiteG1 = [];
let naviAffondateG1 = [];

let naviColpiteG2 = [];
let naviAffondateG2 = [];
let possibiliOri = [];
let possibiliVer = [];
let idColpiti= [];

if(localStorage.getItem("griglia1") !== null){
    navim.forEach(nave => nave.remove());
    zonaBottoni.style.display = "none";
    bottoneSalvataggio.style.display = "inline";
    turno = localStorage.getItem("turno")
    isBlitz = localStorage.getItem("blitz")
    turnoplayer = 1;
    let JnaviG1 = localStorage.getItem("navi1");
    let naviG1 = JSON.parse(JnaviG1);
    naviColpiteG1=naviG1[0];
    naviAffondateG1=naviG1[1];
    let JnaviG2 = localStorage.getItem("navi2");
    let naviG2 = JSON.parse(JnaviG2);
    naviColpiteG2=naviG2[0];
    naviAffondateG2=naviG2[1];
    let Jmemoria = localStorage.getItem("memoria_computer");
    let memoria = JSON.parse(Jmemoria);
    possibiliOri =memoria[0];
    possibiliVer=memoria[1];
    idColpiti=memoria[2];
    if(turno === "player"){
        const celle = document.querySelectorAll("#g2 div");
        celle.forEach(cella => cella.addEventListener("click", esplodi));
        infoTurno.textContent ="e' il tuo turno";
    }else{
        turnoComputer(2000);
    }
}

let turni = 0

function inizio(){
    SBottone.play();
    if(turnoplayer === 0){
        if(zonaNavi.children.length !== 0){
            info.textContent = "piazza tutte le tue navi!";
        }else{
            turnoplayer = 1;
            zonaBottoni.style.display = "none";
            bottoneSalvataggio.style.display = "inline";
            turno = Math.floor(Math.random()*2) === 1 ? "player" : "computer";
            if(turno === "player"){
                const celle = document.querySelectorAll("#g2 div");
                celle.forEach(cella => cella.addEventListener("click", esplodi));
                infoTurno.textContent ="e' il tuo turno";
            }else{
                turnoComputer(500);
            }   
        }
    }
}

bottoneInizio.addEventListener("click", inizio);






function esplodi(e){
    if(!gameOver){
        turni++;
        if(!(e.target.classList.contains("esploso") || e.target.classList.contains("pluff"))){
            if(e.target.classList.contains("occupato")){
                e.target.classList.add("esploso");
                info.textContent = "hai colpito una nave del computer";
                let classi = Array.from(e.target.classList);
                classi = classi.filter(classe => classe !== "cella");
                classi = classi.filter(classe => classe !== "esploso");
                classi = classi.filter(classe => classe !== "occupato");
                for(let i=0; i< navi.length;i++){
                    classi = classi.filter(classe => classe !== navi[i].nome)
                }
                naviColpiteG1.push(...classi);
                controllo_eliminazione(naviColpiteG1,naviAffondateG1,"g1");
                if(isBlitz === true){
                    return;
                }
            }else{
                info.textContent = "non hai colpito niente";
                e.target.classList.add("pluff");
                e.target.style.backgroundColor ="cadetblue";
                SPluff.play();
            }
        }else{
            info.textContent = "Non sparare dove hai gia' sparato!";
            return;
        }
        const celle = document.querySelectorAll("#g2 div");
        celle.forEach(cella => cella.removeEventListener("click", esplodi));
        setTimeout(turnoComputer(2000), 500);
    }
}
const geval = eval;
function controllo_eliminazione(navicolpite, naviaffondate, user){
    let nave = navicolpite[navicolpite.length-1];
    let nave_nome = user === "g1" ? nave.slice(0,-1) : nave;
    if((navicolpite.filter(naveaffondata => naveaffondata === nave)).length === (geval(nave_nome)).lunghezza){
        if(user === "g1"){
            info.textContent = "hai affondato una nave del computer";
            SAffonda.play();
            naviColpiteG1 = naviColpiteG1.filter(naveaffondata => naveaffondata !== nave);
            naviaffondate.push(nave);
            if(naviaffondate.length === 10){
                info.textContent = "hai vinto!";
                SAffonda.pause();
                SAffonda.currentTime = 0;
                SVittoria.play();
                gameOver = true;
                statistiche(true);
                azzera();
            }
        }else{
            info.textContent = "Il computer ha affondato una delle tue navi";
            SAffonda.play();
            naviColpiteG2 = naviColpiteG2.filter(naveaffondata => naveaffondata !== nave);
            naviaffondate.push(nave);
            if(naviaffondate.length === 10){
                info.textContent = "hai perso!";
                SAffonda.pause();
                SAffonda.currentTime = 0;
                SSconfitta.play();
                gameOver = true;
                statistiche(false);
                azzera();
            }
            return true;
        }
        }else{
            SColpo.play();
    }
}








function turnoComputer(tempo){
    turno = "computer";
    if(!gameOver){
        infoTurno.textContent ="turno del computer";
        const celle = document.querySelectorAll("#g1 div");
        setTimeout(()=>{
            if(naviColpiteG2.length > 0){
                let possibili = [...possibiliOri,...possibiliVer];
                let indicepossibili = Math.floor(Math.random()*possibili.length);
                let id = possibili[indicepossibili];
                let orizzontale = indicepossibili < possibiliOri.length;
                if(celle[id].classList.contains("occupato")){                    
                    if(orizzontale){
                        possibiliVer = [];            
                        if(id > idColpiti[0]){
                            controllaEAggiungi(id, id+1, celle, true , possibiliOri);
                        }else{
                            controllaEAggiungi(id, id-1, celle, true , possibiliOri);
                        }
                    }else{
                        possibiliOri = [];                       
                        if(id > idColpiti[0]){
                            controllaEAggiungi(id, id+lato, celle, false , possibiliVer);
                        }else{
                            controllaEAggiungi(id, id-lato, celle, false , possibiliVer);
                        }
                    }
                    celle[id].classList.add("esploso");
                    info.textContent = "Il computer ha colpito una delle tue navi";
                    idColpiti.push(id);
                    let classi = Array.from(celle[id].classList);
                    classi = classi.filter(classe => classe !== "cella");
                    classi = classi.filter(classe => classe !== "esploso");
                    classi = classi.filter(classe => classe !== "occupato");
                    naviColpiteG2.push(...classi);
                    if(controllo_eliminazione(naviColpiteG2, naviAffondateG2, "g2")){
                        let celleDaEscludere = adiacenti(celle,Math.min(...idColpiti),eval(...classi),orizzontale);
                        celleDaEscludere.forEach(cella => {
                            try{
                                cella.classList.add("pluff");
                                cella.style.backgroundColor ="cadetblue";
                            }catch{}     
                            })


                    }
                    if(naviColpiteG2.length === 0){
                        possibiliOri = [];
                        possibiliVer = [];
                        idColpiti= [];
                    }
                    if(isBlitz === true){
                        turnoComputer(2000)
                    }
                }else{
                    celle[id].classList.add("pluff");
                    celle[id].style.backgroundColor ="cadetblue";
                    info.textContent = "il computer non ha colpito niente";
                    SPluff.play();
                    
                }
                if(orizzontale){
                    possibiliOri = possibiliOri.filter(indice => indice !== id);
                }else{
                    possibiliVer = possibiliVer.filter(indice => indice !== id);
                }



            }else{
                let randomindice = Math.floor(Math.random()*lato*lato);
                if(!(celle[randomindice].classList.contains("esploso") || celle[randomindice].classList.contains("pluff"))){
                    if(celle[randomindice].classList.contains("occupato")){
                        celle[randomindice].classList.add("esploso");
                        info.textContent = "Il computer ha colpito una delle tue navi";
                        let classi = Array.from(celle[randomindice].classList);
                        classi = classi.filter(classe => classe !== "cella");
                        classi = classi.filter(classe => classe !== "esploso");
                        classi = classi.filter(classe => classe !== "occupato");
                        naviColpiteG2.push(...classi);
                        if(naviColpiteG2 == "sottomarino"){
                            let celleDaEscludere = adiacenti(celle,randomindice,sottomarino,true);
                            celleDaEscludere.forEach(cella => {
                                try{
                                    cella.classList.add("pluff");
                                    cella.style.backgroundColor ="cadetblue";
                                }catch{}     
                                })
                        }
                        controllo_eliminazione(naviColpiteG2, naviAffondateG2, "g2");
                        if(naviColpiteG2.length > 0){
                            controllaEAggiungi(randomindice, randomindice+1, celle, true , possibiliOri);
                            controllaEAggiungi(randomindice, randomindice-1, celle, true , possibiliOri);
                            controllaEAggiungi(randomindice, randomindice+lato, celle, false , possibiliVer);
                            controllaEAggiungi(randomindice, randomindice-lato, celle, false , possibiliVer);
                            idColpiti.push(randomindice);
                        }
                        if(isBlitz === true){
                            turnoComputer(2000);
                        }
                    }else{
                        celle[randomindice].classList.add("pluff");
                        celle[randomindice].style.backgroundColor ="cadetblue";
                        info.textContent = "il computer non ha colpito niente";
                        SPluff.play();
                    }
                }else
                    turnoComputer(0);
            }
            
            turno = "player";
            const cellec = document.querySelectorAll("#g2 div");
            cellec.forEach(cella => cella.addEventListener("click", esplodi));
            infoTurno.textContent ="e' il tuo turno";
        }, tempo)
        
    }

}


function controllaId(idrelativo, id, celle, orizzontale){
    if(orizzontale){
        if(Math.floor(id/10) !== Math.floor((idrelativo)/10))
            return false;
    }else{
        if(id < 0 || id > 99){
            return false;
        }
    }
    if(celle[id].classList.contains("pluff")){
        return false;
    }
    return true;
}
function controllaEAggiungi(idrelativo, id, celle, orizzontale, array){
    if(controllaId(idrelativo, id, celle, orizzontale)){
        array.push(id);
    }
}

function setColori(colori){
    for(let i = 0; i < Object.keys(colori).length;i++){
        let naviz = Array.from(document.getElementsByClassName(navi[i].nome+"m"));
        naviz.forEach(nave => nave.style.backgroundColor=colori[navi[i].nome]);
    }


}

setColori(colori);

function blitz(){
  let checkBox = document.getElementById("check_blitz");
  if(checkBox.checked === true){
    isBlitz = true;
  }else{
    isBlitz = false;
  }

}

function salva(){
    if(turnoplayer === 1 && gameOver !== true){
        let celle1 = Array.from(document.querySelectorAll("#g1 div"));
        let celle2 = Array.from(document.querySelectorAll("#g2 div"));
        let griglia1 = [];
        let griglia2 = [];
        celle1.forEach(cella => griglia1.push([cella.className,cella.style.backgroundColor]));
        celle2.forEach(cella => griglia2.push([cella.className,cella.style.backgroundColor]));
        let Jgriglia1 = JSON.stringify(griglia1);
        let Jgriglia2 = JSON.stringify(griglia2);
        localStorage.setItem("griglia1", Jgriglia1);
        localStorage.setItem("griglia2", Jgriglia2);
    
        localStorage.setItem("turno",turno);
        localStorage.setItem("blitz",isBlitz);

        let Jnavi1 = JSON.stringify([naviColpiteG1,naviAffondateG1])
        let Jnavi2 = JSON.stringify([naviColpiteG2,naviAffondateG2])
        let Jmemoria = JSON.stringify([possibiliOri,possibiliVer,idColpiti])

        localStorage.setItem("navi1",Jnavi1);
        localStorage.setItem("navi2",Jnavi2);
        localStorage.setItem("memoria_computer",Jmemoria);

    }
}

function azzera(){
    localStorage.removeItem("griglia1");
    localStorage.removeItem("griglia2");
    localStorage.removeItem("turno");
    localStorage.removeItem("blitz");
}


function casuali(){
    SBottone.play();
    let celle = Array.from(document.querySelectorAll("#g1 div"));
    navim.forEach(nave => nave.remove());
    celle.forEach(cella => {
        cella.className = "cella";
        cella.style.backgroundColor="blue";
    });
    for(let i=0; i < navi.length; i++){
        for(let j=5; j > navi[i].lunghezza; j--){
            angolo = Math.floor(Math.random()*2);
            aggiunginavi(navi[i],"g1");
        }
    }
}
function impostazioni(){
    SBottone.play();
    salva();
    setTimeout(() => {location.href='impostazioni.html'},100);
}
function statistiche(player){
    if(player) localStorage.setItem("vittorie",Number(localStorage.getItem("vittorie"))+1);
    else localStorage.setItem("sconfitte",Number(localStorage.getItem("sconfitte"))+1);
    if((turni < Number(localStorage.getItem("turni")) || localStorage.getItem("turni") === null) && player) localStorage.setItem("turni",turni);

    localStorage.setItem("naviperse",Number(localStorage.getItem("naviperse"))+naviAffondateG2.length);
    localStorage.setItem("navisconfitte",Number(localStorage.getItem("navisconfitte"))+naviAffondateG1.length);

}
