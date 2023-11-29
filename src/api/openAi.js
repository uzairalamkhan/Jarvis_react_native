import axios from "axios";
// const axios = require('axios');

const apiKey = require("../constants");

const client = axios.create({
    headers:{
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
    }
})

const chatGptEndpoint='https://api.openai.com/v1/chat/completions';
const dalleEndPoint='https://api.openai.com/v1/images/generations';

export const apicall= async(prompt,messages)=>{
    try{
        const res=await client.post(chatGptEndpoint,{
        model: "gpt-3.5-turbo-0613",
        messages : [{
            role:'user',
            content:`Does this message want to generate an AI picture , image,art or anything similar? ${prompt} simply answer with a yes or no.`,
        }]
        })
        // console.log('data:',res.data.choices[0].message);
        let isArt = res.data?.choices[0]?.message?.content;
        isArt=isArt.trim();
        if(isArt.toLowerCase().includes('yes')){
            console.log('dalle api call');
            return dalleApiCall(prompt,messages || []);
        }else{
            console.log('chat gpt api call');
            return chatgptApiCall(prompt,messages || [])

        }

    }
    catch(err){
        console.log('error: ',err);
        return Promise.resolve({success:false,msg:err.message});
    }
}

const chatgptApiCall = async (prompt, messages)=>{
    try{
        const res = await client.post(chatGptEndpoint, {
            model: "gpt-3.5-turbo-0613",
            messages
        });

        let answer = res.data?.choices[0]?.message?.content;
        messages.push({role: 'assistant', content: answer.trim()});
        // console.log('got chat response', answer);
        return Promise.resolve({success: true, data: messages}); 

    }catch(err){
        console.log('error: ',err);
        return Promise.resolve({success: false, msg: err.message});
    }
}

const dalleApiCall = async (prompt, messages)=>{
    try{
        const res = await client.post(dalleEndPoint, {
            prompt,
            n: 1,
            size: "512x512"
        });

        let url = res?.data?.data[0]?.url;
        console.log('got image url: ',url);
        messages.push({role: 'assistant', content: url});
        return Promise.resolve({success: true, data: messages});

    }catch(err){
        console.log('error: ',err);
        return Promise.resolve({success: false, msg: err.message});
    }
}

