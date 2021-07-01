function novoElemento(tagName,className){
    /* funcao que cria um novo elemento recebendo a tag do elemento que ssera criado e a classe com que
    esse elemento sera acrescentado */
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false){/* funcao construtora */
    this.elemento = novoElemento('div','barreira')/* this. mostra que e um atributo dentro da funcao */

    const borda = novoElemento('div','borda')
    const corpo = novoElemento('div','corpo')

    /* adicinando os elementos como filho na div elemento criado no começo */
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
    
}

function PardeBarreiras(altura,abertura,x){
    /*Quando coloca this em um elemento dentro de um funcao construtora,esse elemento
    pode ser visto fora da funcao  */

    this.elementoParBareira = novoElemento('div','par-de-barreiras')

    /* criando uma const o atributo fica sendo visto apenas na funcao */
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elementoParBareira.appendChild(this.superior.elemento)/* quando instenciada, superiro e inferior
    ganharam um atributo escrito elemento, esses  atributos que estao sendo adicionados dentro da div
    criada agora par-de -barreiras */
    this.elementoParBareira.appendChild(this.inferior.elemento)

    this.sortearAbertura=()=>{
        const alturaSuperior = Math.random() * (altura - abertura)/* random gera um numero entre 0 e 1
        multiplicando o reusltado de altura - abertura */
        const alturaInferior =  altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elementoParBareira.style.left.split('px')[0])/* pegando a posicao
    atual do x(eixo horizontal) */

    this.setX = (x) => this.elementoParBareira.style.left=`${x}px`/* muda a posicao do X no eixo
    horizontal */

    this.getLargura = () => this.elementoParBareira.clientWidth/* pega a largura do elemento */

    this.sortearAbertura()
    this.setX(x)

}

/* const b = new PardeBarreiras(45,50,300)
 b objeto criado a partir da funcao construtora
dentro da funcao construtura ela constroi a div que de fato sera adicionada no jogo 
document.querySelector('[wm-flappy]').appendChild(b.elementoParBareira)
 */

function Barreiras(altura, largura, abertura,espaco,notificarPonto){
    this.pares=[
        new PardeBarreiras(altura,abertura,largura),
        new PardeBarreiras(altura,abertura,largura + espaco),
        new PardeBarreiras(altura,abertura,largura +espaco*2),
        new PardeBarreiras(altura,abertura,largura + espaco*3)
    ]


    const deslocamento = 3
    this.animar = () =>{
        this.pares.forEach( par =>{
            par.setX(par.getX() - deslocamento)

            //quando o elemento sair da área do jogo

            /* se o getX passa a parte do jogo, ele começa virar negativo */
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
                const meio = largura / 2
                const cruzouMeio = par.getX() + deslocamento >= meio &&
                par.getX() < meio
                cruzouMeio && notificarPonto()

           
        })
    }

}

function passaro(alturaJogo){
    let voando = false

    this.elemento = novoElemento('img','passaro')
    this.elemento.src = '../images/passarinho.png'

    this.getY = () =>  parseInt(this.elemento.style.bottom.split('px')[0])
        
     
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false    

    this.animar = () =>{
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0){
            this.setY(0)
        } else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        }else{
            this.setY(novoY)
        }


    }
    this.setY(alturaJogo / 2)

}

function ProgressoPontos(){
    this.elemento = novoElemento('span','progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    
    this.atualizarPontos(0)
}


function FlappyBird(){
    let pontos = 0

    const areaJogo = document.querySelector('[wm-flappy]')/* procura pelo atributo e pega o elemento com
    esse atributo */
    const altura = areaJogo.clientHeight /* pega a aultura do componente */
    const largura = areaJogo.clientWidth /* pega a largura do componente */


    const progresso = new ProgressoPontos() 
    const barreiras = new Barreiras(200,701,45,300, ()=> progresso.atualizarPontos(++pontos))
    const passarinho = new passaro(400)
 


    
    areaJogo.appendChild(passarinho.elemento) 
    areaJogo.appendChild(progresso.elemento)
    barreiras.pares.forEach(par => areaJogo.appendChild(par.elementoParBareira))
    
    this.start = ()=>{
        //loop do jogo
        const temporizador= setInterval(()=>{
            barreiras.animar()
            passarinho.animar()

            /* se a colisao for true, ele entra no if, se for false ele nao entra */
            if(colisao(passarinho,barreiras)){
                clearInterval(temporizador)
            }

        },20)

        /* 
        O setInterval serve para executar uma função ou instrução várias vezes em um determinado intervalo
         de tempo. A sua sintaxe é: setInterval(funcao(), tempo); Isto significa que a função "funcao" será
          executada assim cada vez que se atingir o determinado tempo. */
    }
} 
 
function estaoSobrepostos(elementoA,elementoB){
    const a = elementoA.getBoundingClientRect() /* dimensoes do retangula que envolve o elemento A */
    const b = elementoB.getBoundingClientRect() /* dimensoes do retangulo que envolve o elemento B */

    /* 
        a.left + a.width dao até o lado direito do elemento do A que no caso e o passaro
    */

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colisao(passaro, barreiras){

    let colidiu=false

    barreiras.pares.forEach(PardeBarreiras =>{
        if(!colidiu){
            const superior = PardeBarreiras.superior.elemento
            const inferior = PardeBarreiras.inferior.elemento

            colidiu = estaoSobrepostos(passaro.elemento,superior)
            || estaoSobrepostos(passaro.elemento,inferior)
        }
    })
    return colidiu
}



new FlappyBird().start() 


 //-----testando------
/* const barreiras = new Barreiras(200,701,50,300)
const passarin = new passaro(400)
const areaJogo = document.querySelector('[wm-flappy]')
 const pontosJogo = new Progresso().elemento 

areaJogo.appendChild(passarin.elemento)
 areaJogo.appendChild(pontosJogo) 
barreiras.pares.forEach(par => areaJogo.appendChild(par.elementoParBareira))
 setInterval( ()=>{
    barreiras.animar()
    passarin.animar()
},30)  */

