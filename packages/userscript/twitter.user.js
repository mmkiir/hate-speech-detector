// ==UserScript==
// @name        New script - twitter.com
// @namespace   Violentmonkey Scripts
// @match       https://twitter.com/*
// @grant       none
// @version     1.0
// @author      -
// @description 12/12/2022, 2:09:25 AM
// ==/UserScript==
window.addEventListener("load", () => {
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          const tweet = node.querySelector("article");
          if (tweet) {
            if (tweet.dataset.checked) return;
            tweet.dataset.checked = true;
            const tweetText = tweet.innerText;
            fetch("http://localhost:5000/tweet", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ tweet: tweetText }),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log("tweetText:", tweetText, "data:", data);
                if (data.class === 2) return;
                tweet.style.pointerEvents = "none";
                const warning = document.createElement("div");
                warning.style.position = "absolute";
                warning.style.inset = "2px";
                warning.style.display = "flex";
                warning.style.flexDirection = "column";
                warning.style.justifyContent = "center";
                warning.style.alignItems = "center";
                warning.style.backgroundColor = "rgba(0,0,0,0.9)";
                warning.style.backdropFilter = "blur(10px)";
                warning.style.fontFamily =
                  "TwitterChirp,Helvetica Neue,Helvetica,Arial,sans-serif";
                warning.style.margin = "4px";
                warning.style.borderRadius = "20px";
                const warningText = document.createElement("p");
                switch (data.class) {
                  case 0:
                    warningText.innerText =
                      "This tweet might contain hate speech";
                    break;
                  case 1:
                    warningText.innerText =
                      "This tweet might contain offensive language";
                    break;
                }
                warningText.style.color = "white";
                warning.appendChild(warningText);
                const warningButton = document.createElement("button");
                warningButton.innerText = "Show tweet";
                warningButton.addEventListener("click", () => {
                  warning.style.display = "none";
                  tweet.style.pointerEvents = "auto";
                });
                warning.appendChild(warningButton);
                tweet.insertAdjacentElement("afterend", warning);
              });
          }
        });
      }
    });
  });
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
