(function () {
  // Prevent multiple loads
  if (window.__CHAT_WIDGET_LOADED__) return;
  window.__CHAT_WIDGET_LOADED__ = true;

  // Get current script tag
  var currentScript = document.currentScript;

  // Read API key from script attribute
  var apiKey = currentScript.getAttribute("data-api-key");

  if (!apiKey) {
    console.error("Chat Widget: data-api-key is missing.");
    return;
  }

  // ===============================
  // Create Floating Button
  // ===============================
  var button = document.createElement("div");
  button.innerHTML = "💬";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.width = "60px";
  button.style.height = "60px";
  button.style.borderRadius = "50%";
  button.style.background = "#2563eb";
  button.style.color = "#fff";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.cursor = "pointer";
  button.style.zIndex = "999999";
  button.style.fontSize = "24px";
  button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";

  document.body.appendChild(button);

  // ===============================
  // Create Iframe (Hidden Initially)
  // ===============================
  var iframe = document.createElement("iframe");
  iframe.src = "http://localhost:3000/widget-chat?apiKey=" + apiKey;
  iframe.style.position = "fixed";
  iframe.style.bottom = "90px";
  iframe.style.right = "20px";
  iframe.style.width = "360px";
  iframe.style.height = "500px";
  iframe.style.maxHeight = "80vh";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframe.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
  iframe.style.display = "none";
  iframe.style.zIndex = "999999";

  document.body.appendChild(iframe);

  // ===============================
  // Toggle Widget
  // ===============================
  button.addEventListener("click", function () {
    if (iframe.style.display === "none") {
      iframe.style.display = "block";
    } else {
      iframe.style.display = "none";
    }
  });
})();