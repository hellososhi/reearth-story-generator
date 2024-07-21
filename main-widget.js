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
    #stories {
      margin-top: 12px;
    }
    #stories img {
      width: 100%;
    }
  </style>

  <div id="wrapper">
    <div class="api-key">
      <div>OpenAI API Key</div>
      <input type="password" id="openai-api-key">
    </div>
    <button id="button">写真を撮る</button>
    <div id="stories"></div>
  </div>

  <script>
    const stories = [];

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
        document.getElementById("stories").appendChild(img);
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
                    "text": "あなたはストーリーテラーです。これから画像が与えられます。その画像から想像できるストーリーを作ってください。画像は複数回与えられるので、前のストーリーにつながるようにストーリーを続けてください。文章は一つの画像につき400文字にしてください。文章の装飾は使わず、プレーンテキストで出力してください。"
                  },
                  ...stories.map(story => [
                    {
                      "type": "image_url",
                      "image_url": {
                        "url": story.image
                      }
                    },
                    {
                      "type": "text",
                      "text": story.description
                    }
                  ]).flat(),
                  {
                    "type": "image_url",
                    "image_url": {
                      "url": capturedImage
                    }
                  }
                ]
              }
            ],
            "max_tokens": 600
          })
        }).then(res => res.json()).then((data) => {
          const response = data.choices[0].message.content;
          document.getElementById("stories").appendChild(document.createTextNode(response));
          stories.push({
            image: capturedImage,
            description: response,
          });
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
