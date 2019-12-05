require("dotenv/config")
const cheerio = require("cheerio")
const request = require('request')
const mongoose = require("mongoose")
const transporter = require("./email")
const State = require("./state")

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

function scrap(url){
    request(url, parseRequest);
}

function parseRequest(error, response, html){
    if (error) console.log(error);
    if (!error){
        //Aqui carregamos o cheerio, passando o HTMl que o request retornou.
        var $ = cheerio.load(html);
        if ($('.clearfix')){
            //Aqui pegamos todas as URL's dentro da div com os anúncios
            let array = []
            $('.clearfix').find('a').each(function(index, a) {
                var toQueueUrl = {
                    text: $(a).text().replace(/(\d+)%/g, "").trim(),
                    href: $(a).attr('href').trim()
                }
            
                array.push(toQueueUrl)
            });
            var flash = array.find(c => c.text.includes("The Flash"))
            
            async function loadState(){
                var state = await State.findOne({ serieName: "The Flash" })
                if(flash){
                    if(!state){
                        await State.create({
                            serieName: "The Flash",
                            serie: {
                                text: flash.text,
                                href: flash.href
                            },
                            status: "em progresso"
                        })
                        return
                    }
                    else{
                        if(state.status !== "em progresso"){
                            await transporter.sendMail({
                                to: process.env.MY_EMAIL,
                                from: JSON.parse(process.env.EMAIL).user,
                                html: `
                                Legenda sendo feita,
                                <h1>Episodio: ${flash.text}</h1>
                                `
                            })
                            state.serie = {
                                text: flash.text,
                                href: flash.href
                            }
                            state.status = "em progresso"
                            state.save()
                            return 
                        }
                    }
                }
                if(!flash){
                    if(!state){
                        await State.create({
                            serieName: "The Flash",
                            status: "terminada"
                        })
                        return
                    }
                    else{
                        if(state.status === "em progresso"){
                            await transporter.sendMail({
                                to: process.env.MY_EMAIL,
                                from: JSON.parse(process.env.EMAIL).user,
                                html: `
                                Legenda pronta
                                <h1>Episodio: ${state.serie.text}</h1>
                                <a href=${state.serie.href}>Ir para</a>
                                `
                            })
                            state.status = "terminada"
                            state.save()
                            return
                        }
                    }
                }
            }
            loadState()
        }
    }
}
var url = "http://insubs.com/";
const interval = setInterval(function() {
    scrap(url);
}, 300000);
interval