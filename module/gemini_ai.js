

const API_KEY = "AIzaSyAYadrNbAJu8LP-Zf2G1oQNSAYdqt0c5mk";
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// The Gemini 1.5 models are versatile and work with most use cases
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});




//영어단어를 입력하면 해석본을 출력하는 코드
async function word_translate(word) {
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const prompt = `please translate the english vocabulary '${word}' into Korean. only respond the translated korean word. do not add any prefix or suffix except for the translated korean vocabulary.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
}

//기사 하나를 출력하는 코드
async function get_article(category){
    const random_number = Math.floor(Math.random() * 100);
    const prompt = 
    `you should think 100 very diffrent topics about ${category}, and use the ${random_number}th topic to generate only one unique article about that topic
    you don't need to return 100 generated topics only tell me the choose topic and the article
    The response must only contain three format named Topic:, Title: and Contents:
        Topic: <give the topic which is the ${random_number}th topic you think>
        Title: <title of the article in 'string' type, and must be filled in meaningful context>
        Contents: <contents of the article, just String>`;
    
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    const cleanedText = text.replace(/\*\*/g, '');
    console.log(text);
    const titleMatch = cleanedText.match(/Title:\s*([\s\S]*?)\s*Contents:/);
    const contentsMatch = cleanedText.match(/Contents:\s*([\s\S]*)/);

    let title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    let contents = contentsMatch ? contentsMatch[1].trim() : 'No contents available';

    title = title.replace(/[#*]/g, '');
    contents = contents.replace(/[#*]/g, '');
    //console.log(`제목: ${title}`);
    //console.log(`내용: ${contents}`);

    const articleData = {
        title: title,
        contents: contents
    };

    return articleData;
}

module.exports = {word_translate, get_article};