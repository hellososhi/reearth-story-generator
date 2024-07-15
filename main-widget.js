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
      box-sizing: border-box;
      border-radius:12px;
      padding: 12px;
      background: white;
    }
  </style>

  <div id="wrapper">
    <button id="button">Capture</button>
    <p>Click this button will capture the map</p>
  </div>

  <script>
    document.getElementById("button").addEventListener("click", (e) => {
      parent.postMessage({ type: "captureScreen" }, "*");
    });
    addEventListener("message", e => {
      if (e.source !== parent) return;
      if (e.data.type && e.data.type === 'getCaptureScreen') {
        const fileName = "capture.png";
        const link = document.createElement("a");
        link.download = fileName;
        link.href = e.data.payload;
        link.click();
        link.remove();
      }
    })
  </script>
`);

reearth.on("message", msg => {
  if (msg.type === "captureScreen") {
    reearth.ui.postMessage({
      type: "getCaptureScreen",
      payload: reearth.scene.captureScreen(),
    });
  }
});
