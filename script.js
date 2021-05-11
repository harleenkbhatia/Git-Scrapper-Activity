require("chromedriver");
const wd = require("selenium-webdriver");
const fs = require("fs");
let browser = new wd.Builder().forBrowser('chrome').build();
let finalData = [];
let projectsAdded = 0;
let totalProjects = 0;

async function getIssues(url, i, j){
    let browser = new wd.Builder().forBrowser('chrome').build();
    await browser.get(url + "/issues");
    await browser.wait(wd.until.elementsLocated(wd.By.css(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title")));
    let issuesBoxes = await browser.findElements(wd.By.css(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title"));
    finalData[i].projects[j]["Issues"] = [];

    if(await browser.getCurrentUrl() == finalData[i].projects[j].projectURL + "/issues"){
        for(let k = 0; k<issuesBoxes.length && k<2; k++){
            let heading = await issuesBoxes[k].getAttribute("innerText");
            let url = await issuesBoxes[k].getAttribute("href");
            finalData[i].projects[j].Issues.push({heading : heading, url : url});
        }
    }
    projectsAdded += 1;
    if(projectsAdded == totalProjects){
        fs.writeFileSync("finalData.JSON", JSON.stringify(finalData));
    }
    browser.close();
}

async function getProjects(url, i){
    let browser = new wd.Builder().forBrowser('chrome').build();
    await browser.get(url);
    await browser.wait(wd.until.elementsLocated(wd.By.css("a.text-bold")));
    let projectUrls = await browser.findElements(wd.By.css("a.text-bold"));
    totalProjects += projectUrls.length > 2 ? 2 : projectUrls.length;
    finalData[i]["projects"] = [];
    for(let j = 0; j<projectUrls.length && j<2; j++){
        finalData[i].projects.push({"projectURL" : await projectUrls[j].getAttribute("href")});    
    }
    for(let j = 0; j<finalData[i].projects.length; j++){
        getIssues(finalData[i].projects[j].projectURL, i, j);
    }
    browser.close();
}
async function main(){
    await browser.get("https://github.com/topics");
    await browser.wait(wd.until.elementLocated(wd.By.css(".no-underline.d-flex.flex-column.flex-justify-center")));
    let topicUrls = await browser.findElements(wd.By.css(".no-underline.d-flex.flex-column.flex-justify-center"));
    for(let i = 0; i<topicUrls.length; i++){
        let url = await topicUrls[i].getAttribute("href");
        finalData.push({"topicURL" : url});
    }
    for(let i = 0; i<finalData.length; i++){
        getProjects(finalData[i].topicURL, i);
    }
    fs.writeFileSync("finalData.JSON", JSON.stringify(finalData));
    browser.close()
}
main()