import express from "express"
const app = express()
import verifier from "alexa-verifier-middleware"
import bodyParser from "body-parser"
 

app.use(verifier)
app.use(bodyParser.json()); 
const SKILL_NAME = 'getGreetings'
const GET_MESSAGE = "hello";
const HELP_MESSAGE ='ask me how i am doing '
const HELP_REPROMPT = 'what can i help you with'
const STOP_MESSAGE = 'ENJOY THE DAY ... SEE YOU SOON'
const MORE_MESSAGE = 'Do you like to ask more'
const PAUSE = '<break time ="0.3s" />'
const WHISPER = '<amazon:effect name="whispered" />'



app.use(bodyParser.json({
    verify: function getRawBody(req,res,buf) {
            req.rawBody = buf.toString();
    }
}))
function requestVerifier(req,res,next){
    verifier(
        req.headers.signaturecertchainurl,
        req.headers.signature,
        req.rawBody,
        function verificationCallback(err){
            if(err){
                res.status(401).json({
                    message:'Verification Failure',
                    error:err
                })
            }else{
                next();
            }
        }
    )
} 

function log(){
    if(true){
        console.log.apply(console,arguments);
    }
}
app.post('/getGreetings',requestVerifier,(req,res)=>{
    if(req.body.request.type === 'LaunchRequest'){
        res.json(getNewMessage());
        isFirstTime = false
    }else if(req.body.request.type === 'SessionEndRequest'){
        log("Sesion end")
    }else if(req.body.request.type === 'IntentRequest'){
        switch (req.body.request.intent.name){
            case 'AMAZON.YesIntent':
                res.json(getNewMessage());
                break;
               case 'AMAZON.NoIntent':
               res.json(stopAndExit());
               break; 
                default:
            }
    }
})
function getNewMessage(){
    var welcomeMessage = 'Welcome to The Alexa SKills'
    if(!isFirstTime){
        welcomeMessage =''
    }
    const tempOutput = WHISPER + GET_MESSAGE +PAUSE;
    const speechOut = welcomeMessage + tempOutput + MORE_MESSAGE
    const more = MORE_MESSAGE
    return buildResponse (speechOut,false,more)
}
function buildResponse(speechText,shouldEndSession,cardText,reprompt){
    const speechOutput = "<speak>"+speechText+"<speak/>"
    var jsonObj = {
        "version":"1.0",
        "response":{
           " shouldEndSession":shouldEndSession,
           "outputSpeech":{
               "type":"SSML",
               "ssml":speechOutput
           }
        },
        "card":{
            "type":"Simple",
            "title":SKILL_NAME,
            "content":cardText,
            "text":cardText
        },
        "reprompt":{
            "outputSpeech":{
                "type":"PlainText",
                "text":reprompt,
                "ssml":reprompt
            }
        }
    }
    return  jsonObj
}
function stopAndExit(){
    var jsonObj = buildResponseWithoutReprompt(speechOutput,true,"");
    return jsonObj
}
function buildResponseWithoutReprompt(speechText,shouldEndSession,cardText){
    const speechOutput = "<speak>"+speechText+"<speak/>"
    var jsonObj = {
        "version":"1.0",
        "response":{
           " shouldEndSession":shouldEndSession,
           "outputSpeech":{
               "type":"SSML",
               "ssml":speechOutput
           }
        },
        "card":{
            "type":"Simple",
            "title":SKILL_NAME,
            "content":cardText,
            "text":cardText
        }
       
        }
    
    return  jsonObj 
}
app.listen(7000,()=>{
    console.log("sever is on 7000")
})