import { extractTeams } from "./extractTeams.js";

/* Get the keywords meta of the active ESPN page, and then send a message that includes the meta content,
 * page url, and page title.
 *
 * keyword meta example: <meta name="keywords", content="NBA, stats, Los Angeles Lakers, Miami Heat" />
 */
chrome.tabs.query(
  {
    active: true,
    currentWindow: true,
  },
  function (tabs) {
    // Code that will be ran by the active ESPN page to get keywords meta and send the message
    const code = `
        var metas = document.getElementsByTagName('meta'); 
        var keywords_meta = '';

        for (var i = 0; i < metas.length; i++) { 
            var name = metas[i].getAttribute("name");
            var content = metas[i].getAttribute("content");
            if (name === "keywords") {
                keywords_meta = content;
            }    
        } 
        
        chrome.runtime.sendMessage({
            method: "getKeywordsMeta",
            metas: keywords_meta,
            tab_url: "${tabs[0].url}",
            tab_title: "${tabs[0].title}"
        });`;

    chrome.tabs.executeScript(
      tabs[0].id,
      {
        code: code,
      },
      function () {
        if (chrome.runtime.lastError) {
          // Failed to get meta tags of ESPN page
          console.log(
            "There was an error : \n" + chrome.runtime.lastError.message
          );

          const teams = extractTeams(tabs[0].title, tabs[0].url);
          console.log("Teams found: ");
          teams.forEach((element) => {
            console.log(element);
          });
        }
      }
    );
  }
);

/* Listener for messages sent by active ESPN page. Upon receiving the message, the listener should
 * run the 'main' function that provides users with links to discussion threads.
 */
chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.method == "getKeywordsMeta") {
    console.log("Metas in listener: " + request.metas);

    // First extract teams
    const teams = extractTeams(
      request.tab_title,
      request.tab_url,
      request.metas
    );

    console.log("Teams found: ");
    const all_teams_div = document.getElementById("teams");

    teams.forEach((element) => {
      console.log(element);
      const team_div = document.createElement("div");
      team_div.setAttribute("class", "team");
      team_div.setAttribute("id", element.fullname);

      const title = document.createElement("h3");
      title.innerHTML = element.fullname;

      //   const reddit_link = document.createElement("p");
      //   reddit_link.innerHTML = element.reddit;
      //   reddit_link.setAttribute("class", "reddit badge badge-primary");
      const reddit_link = document.createElement("a");
      let linktext = document.createTextNode(element.fullname);
      reddit_link.appendChild(linktext);
      reddit_link.href = element.reddit;
      reddit_link.setAttribute("class", "reddit badge badge-primary");

      const discord_link = document.createElement("p");
      discord_link.innerHTML = element.discord;
      discord_link.setAttribute("class", "discord badge badge-warning");

      team_div.appendChild(title);
      team_div.appendChild(reddit_link);
      team_div.appendChild(discord_link);
      all_teams_div.appendChild(team_div);
    });
  }
});
