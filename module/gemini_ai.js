

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
    const prompt = `Just generate only one article about ${category}. 
    The response must be in the format "Title:" "Contents:":
    Title: <title of the article in 'string' type, and must be filled with meaningful context.>
    Contents: <contents of the article, just String>`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const titleMatch = text.match(/Title:\s*(.*)\s*Contents:/);
    const contentsMatch = text.match(/Contents:\s*([\s\S]*)/);

    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    const contents = contentsMatch ? contentsMatch[1].trim() : 'No contents available';
    //console.log(`제목: ${title}`);
    //console.log(`내용: ${contents}`);

    const articleData = {
        title: title,
        contents: contents
    };

    return articleData;
}

module.exports = {word_translate, get_article};