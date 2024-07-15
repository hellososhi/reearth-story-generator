reearth.ui.show(`
  <style>
    html,body {
      margin: 0;
      width: 350px;
    }
    button {
      margin: 0;
    }
    #wrapper {
      height: 100%;
      max-height: 600px;
      overflow-y: auto;
      box-sizing: border-box;
      border-radius:12px;
      padding: 12px;
      background: white;
    }
    .api-key {
      display: flex;
      gap: 4px;
    }
    #wrapper img {
      width: 100%;
      margin-top: 12px;
    }
  </style>

  <div id="wrapper">
    <div class="api-key">
      <div>OpenAI API Key</div>
      <input type="password" id="openai-api-key">
    </div>
    <button id="button">写真を撮る</button>
  </div>

  <script>
    document.getElementById("button").addEventListener("click", (e) => {
      parent.postMessage({
        type: "captureScreen",
      }, "*");
    });

    addEventListener("message", e => {
      if (e.source !== parent) return;
      if (e.data.type && e.data.type === 'getCaptureScreen') {
        const capturedImage = e.data.payload;
        const img = document.createElement("img");
        img.src = capturedImage;
        document.getElementById("wrapper").appendChild(img);
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + document.getElementById("openai-api-key").value
          },
          body: JSON.stringify({
            "model": "gpt-4o",
            "messages": [
              {
                "role": "user",
                "content": [
                  {
                    "type": "text",
                    "text": "この画像について説明してください。"
                  },
                  {
                    "type": "image_url",
                    "image_url": {
                      "url": capturedImage
                    }
                  }
                ]
              }
            ],
            "max_tokens": 300
          })
        }).then(res => res.json()).then((data) => {
          const response = data.choices[0].message.content;
          document.getElementById("wrapper").appendChild(document.createTextNode(response));
        })
      }
    })
  </script>
`);

reearth.on("message", (msg) => {
  if (msg.type === "captureScreen") {
    reearth.ui.postMessage({
      type: "getCaptureScreen",
      payload: reearth.scene.captureScreen(),
    });
  }
});
