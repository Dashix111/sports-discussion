import { extractTeams, extractLeague } from "./extractTeams.js";
import { getChannelPreview } from "./getChannelPreview.js";

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
        var news_keywords_meta = '';

        for (var i = 0; i < metas.length; i++) { 
            var name = metas[i].getAttribute("name");
            var content = metas[i].getAttribute("content");
            if (name === "keywords") {
                keywords_meta = content;
            } else if (name === "news_keywords") {
                news_keywords_meta = content;
            }
        }

        keywords_meta = keywords_meta || news_keywords_meta;

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
    console.log(request);
    console.log("Metas in listener: " + request.metas);

    const league = extractLeague(request.tab_url);
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
      team_div.setAttribute("class", "p-3 border bg-light");
      team_div.setAttribute("id", element.fullname);

      const team_logo = document.createElement("img");
      team_logo.setAttribute(
        "src",
        `../images/team_logo/${league}/${element.short}.png`
      );
      team_logo.setAttribute("height", 48);
      team_logo.setAttribute("style", "float:right");

      const content_div = document.createElement("div");

      const title = document.createElement("h3");
      title.innerHTML = element.fullname;

      // Reddit
      const reddit_div = document.createElement("div");
      const reddit_img = document.createElement("svg");
      reddit_img.innerHTML = `<svg width="1.3em" height="1.3em" xmlns='http://www.w3.org/2000/svg' class='ionicon align-middle' viewBox='0 0 512 512'><title>Logo Reddit</title><path d='M324 256a36 36 0 1036 36 36 36 0 00-36-36z'/><circle cx='188' cy='292' r='36' transform='rotate(-22.5 187.997 291.992)'/><path d='M496 253.77c0-31.19-25.14-56.56-56-56.56a55.72 55.72 0 00-35.61 12.86c-35-23.77-80.78-38.32-129.65-41.27l22-79 66.41 13.2c1.9 26.48 24 47.49 50.65 47.49 28 0 50.78-23 50.78-51.21S441 48 413 48c-19.53 0-36.31 11.19-44.85 28.77l-90-17.89-31.1 109.52-4.63.13c-50.63 2.21-98.34 16.93-134.77 41.53A55.38 55.38 0 0072 197.21c-30.89 0-56 25.37-56 56.56a56.43 56.43 0 0028.11 49.06 98.65 98.65 0 00-.89 13.34c.11 39.74 22.49 77 63 105C146.36 448.77 199.51 464 256 464s109.76-15.23 149.83-42.89c40.53-28 62.85-65.27 62.85-105.06a109.32 109.32 0 00-.84-13.3A56.32 56.32 0 00496 253.77zM414 75a24 24 0 11-24 24 24 24 0 0124-24zM42.72 253.77a29.6 29.6 0 0129.42-29.71 29 29 0 0113.62 3.43c-15.5 14.41-26.93 30.41-34.07 47.68a30.23 30.23 0 01-8.97-21.4zM390.82 399c-35.74 24.59-83.6 38.14-134.77 38.14S157 423.61 121.29 399c-33-22.79-51.24-52.26-51.24-83A78.5 78.5 0 0175 288.72c5.68-15.74 16.16-30.48 31.15-43.79a155.17 155.17 0 0114.76-11.53l.3-.21.24-.17c35.72-24.52 83.52-38 134.61-38s98.9 13.51 134.62 38l.23.17.34.25A156.57 156.57 0 01406 244.92c15 13.32 25.48 28.05 31.16 43.81a85.44 85.44 0 014.31 17.67 77.29 77.29 0 01.6 9.65c-.01 30.72-18.21 60.19-51.25 82.95zm69.6-123.92c-7.13-17.28-18.56-33.29-34.07-47.72A29.09 29.09 0 01440 224a29.59 29.59 0 0129.41 29.71 30.07 30.07 0 01-8.99 21.39z'/><path d='M323.23 362.22c-.25.25-25.56 26.07-67.15 26.27-42-.2-66.28-25.23-67.31-26.27a4.14 4.14 0 00-5.83 0l-13.7 13.47a4.15 4.15 0 000 5.89c3.4 3.4 34.7 34.23 86.78 34.45 51.94-.22 83.38-31.05 86.78-34.45a4.16 4.16 0 000-5.9l-13.71-13.47a4.13 4.13 0 00-5.81 0z'/></svg>`;

      const reddit_link = document.createElement("a");
      let linktext = document.createTextNode("Reddit: " + element.fullname);
      reddit_link.appendChild(linktext);
      reddit_link.href = "https://" + element.reddit;
      reddit_link.setAttribute("class", "reddit badge badge-primary");
      reddit_link.setAttribute("target", "_blank");
      reddit_div.appendChild(reddit_img);
      reddit_div.appendChild(reddit_link);

      // const preview_div = document.createElement("span");

      const preview_div = document.createElement("ul");
      preview_div.setAttribute("class", "list-group");
      getChannelPreview(element.reddit, 2).then((posts) => {
        posts.map((p) => {
          const post_div = document.createElement("li");
          post_div.setAttribute(
            "class",
            "list-group-item d-flex justify-content-between align-items-center"
          );

          const post_link = document.createElement("a");

          // let linktext = document.createTextNode(p.title + " " + p.ups);
          let title = p.title;
          let title_length = title.length;
          if (title_length >= 100) {
            title = title.substring(0, 100);
            title += "...";
          }

          let linktext = document.createTextNode(title);
          post_link.appendChild(linktext);
          post_link.href = "https://www.reddit.com" + p.url;
          post_link.setAttribute("target", "_blank");
          post_div.appendChild(post_link);
          const trend_score = document.createElement("span");
          trend_score.setAttribute(
            "class",
            "list-groupbadge badge-primary badge-pill"
          );
          let score = document.createTextNode(p.ups);
          trend_score.appendChild(score);
          post_div.appendChild(trend_score);
          preview_div.appendChild(document.createElement("p")); // for spacing
          preview_div.appendChild(post_div);
          // preview_div.appendChild(document.createElement("p")); // for spacing
        });
      });

      reddit_div.appendChild(preview_div);

      // Discord
      const discord_div = document.createElement("div");
      const discord_img = document.createElement("svg");
      discord_img.innerHTML = `<svg width="1.3em" height="1.3em" xmlns='http://www.w3.org/2000/svg' class='ionicon align-middle' viewBox='0 0 512 512'><title>Logo Discord</title><path d='M464 66.52A50 50 0 00414.12 17L97.64 16A49.65 49.65 0 0048 65.52V392c0 27.3 22.28 48 49.64 48H368l-13-44 109 100zM324.65 329.81s-8.72-10.39-16-19.32C340.39 301.55 352.5 282 352.5 282a139 139 0 01-27.85 14.25 173.31 173.31 0 01-35.11 10.39 170.05 170.05 0 01-62.72-.24 184.45 184.45 0 01-35.59-10.4 141.46 141.46 0 01-17.68-8.21c-.73-.48-1.45-.72-2.18-1.21-.49-.24-.73-.48-1-.48-4.36-2.42-6.78-4.11-6.78-4.11s11.62 19.09 42.38 28.26c-7.27 9.18-16.23 19.81-16.23 19.81-53.51-1.69-73.85-36.47-73.85-36.47 0-77.06 34.87-139.62 34.87-139.62 34.87-25.85 67.8-25.12 67.8-25.12l2.42 2.9c-43.59 12.32-63.44 31.4-63.44 31.4s5.32-2.9 14.28-6.77c25.91-11.35 46.5-14.25 55-15.21a24 24 0 014.12-.49 205.62 205.62 0 0148.91-.48 201.62 201.62 0 0172.89 22.95s-19.13-18.15-60.3-30.45l3.39-3.86s33.17-.73 67.81 25.16c0 0 34.87 62.56 34.87 139.62 0-.28-20.35 34.5-73.86 36.19z'/><path d='M212.05 218c-13.8 0-24.7 11.84-24.7 26.57s11.14 26.57 24.7 26.57c13.8 0 24.7-11.83 24.7-26.57.25-14.76-10.9-26.57-24.7-26.57zM300.43 218c-13.8 0-24.7 11.84-24.7 26.57s11.14 26.57 24.7 26.57c13.81 0 24.7-11.83 24.7-26.57S314 218 300.43 218z'/></svg>`;

      const discord_link = document.createElement("a");
      let discord_linktext = document.createTextNode(
        "Discord: " + element.fullname
      );
      discord_link.appendChild(discord_linktext);
      discord_link.href = "https://" + element.discord;
      discord_link.setAttribute("class", "discord badge badge-warning");
      discord_link.setAttribute("target", "_blank");
      discord_div.appendChild(discord_img);
      discord_div.appendChild(discord_link);

      content_div.appendChild(team_logo);
      content_div.appendChild(title);

      content_div.appendChild(discord_div);
      content_div.appendChild(reddit_div);

      team_div.appendChild(content_div);
      all_teams_div.appendChild(team_div);
    });
  }

  return true;
});
