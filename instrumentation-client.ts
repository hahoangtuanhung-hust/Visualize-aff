function supportsFlexGap() {
  const flex = document.createElement("div");
  flex.style.display = "flex";
  flex.style.flexDirection = "column";
  flex.style.rowGap = "1px";
  flex.style.position = "absolute";
  flex.style.visibility = "hidden";

  const firstChild = document.createElement("div");
  const secondChild = document.createElement("div");
  flex.appendChild(firstChild);
  flex.appendChild(secondChild);
  document.body.appendChild(flex);

  const isSupported = flex.scrollHeight === 1;
  document.body.removeChild(flex);
  return isSupported;
}

try {
  if (!supportsFlexGap()) {
    document.documentElement.classList.add("no-flex-gap");
  }
} catch {
  document.documentElement.classList.add("no-flex-gap");
}
