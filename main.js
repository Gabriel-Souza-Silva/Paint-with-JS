$('document').ready(function(){
    let active;
    let isClipping;
    let clipLines = false;
    var stack = []
    var line = []
    var stackReturn = []

    var stackJson = {
        "figuras":{
            "reta": [],
            "circulo":[],
            "retangulo":[],
            "poligono":[]
        }        
    }

    var jsonExportPoli = {
        "ponto":[],
        "cor":{
            "r": null,
            "g": null,
            "b": null
        }
    }   

    const canvas = document.getElementById('canvas')
    const canvasMini = document.getElementById('canvasMini')
    var color = '#5333ed'
    var ciclo = 5
    var rgbColor = convertColor(color)


    var clipPosition = {
        pos1:{
            x:null,
            y:null
        },
        pos2:{
            x:null,
            y:null
        }
    }

    var posicaoOrigem = {
        x: 0,
        y: 0
    }

    var posicaoFinal = {
        x: 0,
        y: 0
    }

    $('#cicleDiv').hide()

    $('#color-pik').on('change paste keyup',() => {
        color = `#${$('#color-pik').val()}`;
        rgbColor = convertColor(color)
        console.log(color)
    });

    $('#cicleDiv').on('change paste keyup',() => {
        ciclo = $('#cicleId').val()
        console.log(ciclo)
    });
       
    
    function DrawCanvasMini(){
        var canvas = document.getElementById("canvas");
        canvasMini.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        // var imgData = ctx.getImageData(0, 0, canvas.width,canvas.height);
        canvasMini.getContext('2d').drawImage(canvas,0,0,300,128);
    }

    function getNormalizePoint(position){
        return {
            "x": position.x / 2560,
            "y": position.y / 1080
        }
    }

    function setNormalizePoint(position){
        position.x = position.x * 2560;
        position.y = position.y * 1080;
        return position;
    }

    function Push(){       
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        stack.push(ctx.getImageData(0,0,canvas.width,canvas.height));
        DrawCanvasMini()
    }

    function PopUndo(){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        
        if(stackReturn.length != 0){
            var canvasImage = stackReturn[stackReturn.length - 1];
            stack.push(canvasImage);
            ctx.putImageData(canvasImage,canvas.offsetLeft,canvas.offsetTop);               
        }

        stackReturn.pop(); 
        DrawCanvasMini()
    }

    function Pop(){  
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        
        
        stack.pop(); 

        if(stack.length != 0){
            var canvasImage = stack[stack.length - 1];            
            stackReturn.push(canvasImage);
            ctx.putImageData(canvasImage,canvas.offsetLeft,canvas.offsetTop);               
        }else{
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height); 
        }
        //stack.pop(); 
        DrawCanvasMini()     
    }

    function getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - canvas.offsetLeft//- rect.left
        const y = event.clientY - canvas.offsetTop// rect.top
        //console.log("canvas.offsetLeft  : ", canvas.offsetLeft,"canvas.offsetTop :",canvas.offsetTop);
        //console.log("getCursorPosition  : ", x,y);
        return {"x": x, "y":y}
    }

    function DrawCoordinates(x,y){	
        var pointSize = 1;
        //console.log("DrawCoordinates  : ", x,y);
        //console.log("==============================================");
        var ctx = document.getElementById("canvas").getContext("2d");
           
        ctx.fillStyle = color;
   
        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, Math.PI * 2, true);
        if(clipLines){
            console.log("clipLines")
             if(clipPosition.pos1.x < x && x < clipPosition.pos2.x  && clipPosition.pos1.y > y && y > clipPosition.pos2.y){
                console.log("is inside")
                 ctx.fill();
             }
         }else{
            ctx.fill();
        }        
    }

    function convertColor(color) {
      
        if(color.substring(0,1) == '#') {
           color = color.substring(1);
         }
      
        var rgbColor = {};
      
        rgbColor.rChannel = parseInt(color.substring(0,2),16);
        rgbColor.gChannel = parseInt(color.substring(2,4),16);
        rgbColor.bChannel = parseInt(color.substring(4),16);
      
        return rgbColor;
    }

    var fullColorHex = function(r,g,b) {   
        var red = rgbToHex(r);
        var green = rgbToHex(g);
        var blue = rgbToHex(b);
        return '#'+red+green+blue;
    };

    var rgbToHex = function (rgb) { 
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) {
             hex = "0" + hex;
        }
        return hex;
    };

    function DrawLine(pos1,pos2){

        if(pos2.x < pos1.x){
            //console.log("Antes")
            //console.log(pos1)
            //console.log(pos2)
            let posreserva = pos1
            pos1 = pos2
            pos2 = posreserva;
            //console.log("Depois")
            //console.log(pos1)
            //console.log(pos2)
        }
        

        let x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;

        
        dx = pos2.x -pos1.x;
        dy = pos2.y - pos1.y;

        
        dx1 = Math.abs(dx);
        dy1 = Math.abs(dy);

        
        px = 2 * dy1 - dx1;
        py = 2 * dx1 - dy1;

        
        if (dy1 <= dx1) {

            
            if (dx >= 0) {
                x =pos1.x; y =pos1.y; xe = pos2.x;
            } else { 
                x = pos2.x; y = pos2.y; xe =pos1.x;
            }

            DrawCoordinates(x, y);

            
            for (i = 0; x < xe; i++) {
                x = x + 1;

                
                if (px < 0) {
                    px = px + 2 * dy1;
                } else {
                    if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                        y = y + 1;
                    } else {
                        y = y - 1;
                    }
                    px = px + 2 * (dy1 - dx1);
                }

            
                DrawCoordinates(x, y);
            }

        } else { 
            
            if (dy >= 0) {
                x =pos1.x; y =pos1.y; ye = pos2.y;
            } else { 
                x = pos2.x; y = pos2.y; ye =pos1.y;
            }

            DrawCoordinates(x, y); 
            

            for (i = 0; y < ye; i= i + 0.1) {
                y = y + 1;
                
                if (py <= 0) {
                    py = py + 2 * dx1;
                } else {
                    if ((dx < 0 && dy<0) || (dx > 0 && dy > 0)) {
                        x = x + 1;
                    } else {
                        x = x - 1;
                    }
                    py = py + 2 * (dx1 - dy1);
                }

                
                DrawCoordinates(x, y);
            }
        }   
    }

    function DrawCircle(pos1,radius) {
        var x = radius;
        var y = 0;
        var x0 = pos1.x
        var y0 = pos1.y
        var radiusError = 1 - x;
        
        while (x >= y) {
            DrawCoordinates(x + x0, y + y0);
            DrawCoordinates(y + x0, x + y0);
            DrawCoordinates(-x + x0, y + y0);
            DrawCoordinates(-y + x0, x + y0);
            DrawCoordinates(-x + x0, -y + y0);
            DrawCoordinates(-y + x0, -x + y0);
            DrawCoordinates(x + x0, -y + y0);
            DrawCoordinates(y + x0, -x + y0);
            y++;
            
            if (radiusError < 0) {
                radiusError += 2 * y + 1;
            }
            else {
                x--;
                radiusError+= 2 * (y - x + 1);
            }
        }
    }

    function DrawRect(pos1,pos4){

        if(pos4.x < pos1.x){
            let posreserva = pos1
            pos1 = pos4
            pos4 = posreserva;
        }

        var pos3 = {
            x: null,
            y: null
        }

        var pos2 = {
            x: null,
            y: null
        }

        pos3.x = pos1.x;
        pos3.y = pos4.y;
        pos2.y = pos1.y;
        pos2.x = pos4.x

        DrawLine(pos1,pos2);
        DrawLine(pos1,pos3);
        DrawLine(pos2,pos4);
        DrawLine(pos3,pos4);
    }

    $('#btnPonto').click(function(e){
        $('#cicleDiv').hide()
        $("#canvas").unbind();
        $("#canvas").click(function(e) {
            DrawPoint(canvas, e)
        })
        
        function DrawPoint(canvas,event){
            var postition2d = getCursorPosition(canvas, event);
            //console.log(postition2d);     

            DrawCoordinates(postition2d.x,postition2d.y);
            Push();
        }
    })    

    $("#btnlinha").click(function(e){
        $('#cicleDiv').hide()
        $("#canvas").unbind();
        console.log("Botao Linha clicado")
        var posicao1 = {
            x: null,
            y: null
            }

        var posicao2 = {
                x: null,
                y: null
            }

            $("#canvas").click(function(e){
                
                if(posicao1.x == null){                
                    posicao1.x = e.clientX
                    posicao1.y = e.clientY                     
                }else{
                    posicao2.x = e.clientX
                    posicao2.y = e.clientY
                    DrawLine(posicao1,posicao2)
                    stackJson.figuras.reta.push({
                        "p1": getNormalizePoint(posicao1),
                        "p2": getNormalizePoint(posicao2),
                        "cor":{
                            "r": rgbColor.rChannel,
                            "g": rgbColor.gChannel,
                            "b": rgbColor.bChannel,
                        }
                    })
                    Push()
                    posicao1.x = null
                }  
            })
    })

    $('#btnCirculo').click(function(e){
        $('#cicleDiv').hide()
        $("#canvas").unbind();
        console.log("Botao Circulo clicado")
        var posicao1 = {
            x: null,
            y: null
        }

        var posicao2 = {
            x: null,
            y: null
        }

        $("#canvas").click(function(e){

                if(posicao1.x == null){                
                    posicao1.x = e.clientX
                    posicao1.y = e.clientY  
                    //console.log(posicao1.x , posicao1.y) 
                }else{
                    posicao2.x = e.clientX
                    posicao2.y = e.clientY
                    var radius = CalculateRadius(posicao1,posicao2)
                    stackJson.figuras.circulo.push({
                        "ponto":getNormalizePoint(posicao1),
                        "raio": CalculateNormalizedRadius(posicao1,posicao2),
                        "cor":{
                            "r":rgbColor.rChannel,
                            "g":rgbColor.gChannel,
                            "b":rgbColor.bChannel
                        }
                    })
                    console.log(stackJson)
                    DrawCircle(posicao1,radius)
                    Push()
                    posicao1.x = null
                }  
            })

        function CalculateRadius(positionA, positionB){
            return Math.sqrt( Math.abs(Math.pow(positionB.x - positionA.x,2)) + Math.abs(Math.pow(positionB.y - positionA.y,2)))
        }

        function CalculateNormalizedRadius(positionA, positionB){
            positionA = getNormalizePoint(positionA)
            positionB = getNormalizePoint(positionB)
            return Math.sqrt( Math.abs(Math.pow(positionB.x - positionA.x,2)) + Math.abs(Math.pow(positionB.y - positionA.y,2)))
        }

    })

    $('#btnRetangulo').click(function(e){
        $('#cicleDiv').hide()
        $("#canvas").unbind();
        console.log("Botao Retangulo clicado")
        var posicao1 = {
            x: null,
            y: null
        }

        var posicao2 = {
            x: null,
            y: null
        }

        $("#canvas").click(function(e){
            if(posicao1.x == null){                
                posicao1.x = e.clientX
                posicao1.y = e.clientY                     
            }else{
                posicao2.x = e.clientX
                posicao2.y = e.clientY
                stackJson.figuras.retangulo.push({
                    "p1": getNormalizePoint(posicao1),
                    "p2": getNormalizePoint(posicao2),
                    "cor":{
                        "r": rgbColor.rChannel,
                        "g": rgbColor.gChannel,
                        "b": rgbColor.bChannel,
                    }
                })
                DrawRect(posicao1,posicao2); 
                Push()               
                posicao1.x = null
                console.log(stackJson)
            }  
        })
    })

    $('#btnLimpar').click(function(e){
        $('#cicleDiv').hide()
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);           
        DrawCanvasMini()
    })

    $('#btnForma').click(function(e){
        $('#cicleDiv').hide()
        $("#canvas").unbind();
        console.log("Botao Forma clicado")

        //#region posicoes
        var posicao1 = {
            x: null,
            y: null
        }

        var posicao2 = {
            x: null,
            y: null
        }

        var posicao3 = {
            x: null,
            y: null
        }

        var posicao4 = {
            x: null,
            y: null
        }
        var posicao5 = {
            x: null,
            y: null
        }
        var posicao6 = {
            x: null,
            y: null
        }
        var posicao7 = {
            x: null,
            y: null
        }

        //#endregion
        

        $("#canvas").click(function(e){                             
            posicao1.x = e.clientX
            posicao1.y = e.clientY 
            DrawShape()                 
        })

        function DrawShape(){
            const orinalX = posicao1.x
            const originalY = posicao1.y
            let raio = 150
            color = '#32CD32'
            //#region DesenhaCirculos
            DrawCircle(posicao1,raio)
            posicao2.x = orinalX + raio; 
            posicao2.y = originalY           
            DrawCircle(posicao2,raio)
            posicao3.x = orinalX - raio; 
            posicao3.y = originalY           
            DrawCircle(posicao3,raio)
            posicao4.x = orinalX - raio/2; 
            posicao4.y = originalY +  129.90         
            DrawCircle(posicao4,raio)
            posicao5.x = orinalX + raio/2; 
            posicao5.y = originalY +  129.90         
            DrawCircle(posicao5,raio)
            posicao6.x = orinalX + raio/2; 
            posicao6.y = originalY -  129.90         
            DrawCircle(posicao6,raio)
            posicao7.x = orinalX - raio/2; 
            posicao7.y = posicao6.y        
            DrawCircle(posicao7,raio)
            //#endregion
            
            color = '#FF0000'
            //#region DesenhaRetas
            posicao1.x = orinalX - 1.5*raio
            posicao2.x = orinalX + 1.5*raio  
            posicao1.y = posicao2.y = originalY + 129,90
            posicao3.x = posicao1.x
            posicao4.x = posicao2.x
            posicao3.y = posicao4.y = originalY - 129,90

            posicao5.x = posicao6.x = orinalX
            posicao5.y = originalY - 2 * 129,90
            posicao6.y = originalY + 2 * 129,90

            DrawLine(posicao1,posicao2) 
            DrawLine(posicao1,posicao3)
            DrawLine(posicao1,posicao4)            
            DrawLine(posicao1,posicao5)
            DrawLine(posicao1,posicao6)
            DrawLine(posicao2,posicao3)
            DrawLine(posicao2,posicao4)
            DrawLine(posicao2,posicao5)
            DrawLine(posicao2,posicao6)
            DrawLine(posicao3,posicao4)
            DrawLine(posicao3,posicao5)
            DrawLine(posicao3,posicao6)            
            DrawLine(posicao4,posicao5)
            DrawLine(posicao4,posicao6)
            DrawLine(posicao5,posicao6)
            //#endregion

            color = '#' + $('#color-pik').val()
            Push()
        }

    })

    $('#btnEspecifico').click(function(e){        
        $('#cicleDiv').show()
        $("#canvas").unbind();
        var raio;
        raio = 200

        // var listCircles = [{
        //     x: 960,
        //     y: 540,
        // }]
        $("#canvas").click(function(e){  
            var listCircles = [{
                x: e.clientX,
                y: e.clientY,
            }]

            var listAux = []
        
            if(!ciclo){
                ciclo = 1
            }
            
            var i = 0
            while( i < ciclo){
                listCircles.forEach((circulo)=>{
                    DrawCircle(circulo,raio)                
                    listAux.push({x : circulo.x + raio, y: circulo.y})
                    listAux.push({x : circulo.x - raio, y: circulo.y})
                    listAux.push({x : circulo.x , y: circulo.y + raio})
                    listAux.push({x : circulo.x, y: circulo.y - raio})
                })
                listCircles = []

                listAux.forEach((item)=>{
                    listCircles.push(item)
                })

                listAux = []

                raio /= 2
                i++
            }

            raio = 200
            Push()           
            })

    })

    $('#btnClip').click(function(e){
        $('#cicleDiv').hide()
        $("#canvas").unbind();

        isClipping = !isClipping;

        if (isClipping) {
            $('#btnClip').html("Cortando")           
            $('#btnClip').css("background-color","#ED0000")
            $("#canvas").click(function(e){
                if(!clipPosition.pos1.x || !clipPosition.pos2.x){
                    if(!clipPosition.pos1.x){                
                        clipPosition.pos1.x = e.clientX
                        clipPosition.pos1.y = e.clientY                     
                    }else{
                        clipPosition.pos2.x = e.clientX
                        clipPosition.pos2.y = e.clientY
                        DrawRect(clipPosition.pos1,clipPosition.pos2); 
                        console.table(clipPosition.pos1) 
                        console.table(clipPosition.pos2) 
                        clipLines = true  
                    }  
                }            
            })
        }else{
            $('#btnClip').css("background-color","#5133e9")
            $('#btnClip').html("Cortar")
            clipPosition.pos1.x = clipPosition.pos1.y = clipPosition.pos2.x = clipPosition.pos2.x = null
            clipLines = false
        }

        
    })

    $('#btnPoligono').click(function(e){
        $('#cicleDiv').hide()
        $("#canvas").unbind();
        let polygonJson;
        var posicao1 = {
            x: null,
            y: null
        }

        var posicao2 = {
            x: null,
            y: null
        }        

        active = !active;

        if (active) {

            $('#btnPoligono').css("background-color","#ED0000")

            jsonExportPoli = {
                "ponto":[],
                "cor":{
                    "r": rgbColor.rChannel,
                    "g": rgbColor.gChannel,
                    "b": rgbColor.bChannel
                }
            }   
            console.log("Modo polígono ativo!");
            $('#btnPoligono').html("Finalizar");

            $("#canvas").click(function(e){
                if(posicao1.x === null){                
                    posicao1.x = e.clientX
                    posicao1.y = e.clientY 
                    posicaoOrigem.x = posicao1.x
                    posicaoOrigem.y = posicao1.y
                    jsonExportPoli.ponto.push(getNormalizePoint(posicao1))                    
                } else {                
                    posicao2.x = e.clientX
                    posicao2.y = e.clientY
                    jsonExportPoli.ponto.push(getNormalizePoint(posicao2))
                    DrawLine(posicao1,posicao2) 
                    posicao1.x = posicao2.x
                    posicao1.y = posicao2.y
                    posicaoFinal.x = posicao2.x
                    posicaoFinal.y = posicao2.y
                } 
            });

        } else {
            $('#btnPoligono').html("Polígono");
            console.log("Modo polígono desativado.");
            $('#btnPoligono').css("background-color","#5133e9")
            stackJson.figuras.poligono.push(jsonExportPoli);
            DrawLine(posicaoOrigem,posicaoFinal)
            DrawCanvasMini()
        }
        
    })

    $('#btnExportar').click(function(e){
        var strStackJson = JSON.stringify(stackJson);
        var blob = new Blob([strStackJson], {type: "application/json"});
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "jsonFiguras.json";
        a.click();
    })


    $('#file-input').change(function(e){
        const file = e.target.files[0];

        let reader = new FileReader();

        reader.readAsText(file);

        reader.onload = function() {
            const importedFigures = JSON.parse(reader.result).figura;

            importedFigures.reta.map( x => {
                let p1 = setNormalizePoint(x.p1)
                let p2 = setNormalizePoint(x.p2)

                color = fullColorHex(x.cor.r,x.cor.g,x.cor.b)
                DrawLine(p1,p2)
            })

            importedFigures.circulo.map( circulo => {
                let p1 = setNormalizePoint(circulo.ponto)

                color = fullColorHex(circulo.cor.r,circulo.cor.g,circulo.cor.b)
                //setNormalizedRadious
                DrawCircle(p1,circulo.raio * 1080)
            })
        };        
    })

    

    //CTRL - Z
    $(document).keydown(function(e){
        if( e.which === 90 && e.ctrlKey ){
            Pop()
        }          
    });

    //CTRL - Y
    $(document).keydown(function(e){
        if( e.which == 89 && e.ctrlKey ){
            PopUndo();
        }          
    });
})



