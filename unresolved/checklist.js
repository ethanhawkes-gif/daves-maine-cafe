(() => {
  const storageKey = "unresolved-post-checklist-v1";
  const shell = document.querySelector(".checklist-shell");
  if (!shell) return;

  const boxes = [...shell.querySelectorAll('input[type="checkbox"]')];
  const status = shell.querySelector(".checklist-progress span");
  const reset = shell.querySelector(".checklist-progress button");

  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    saved = [];
  }

  const render = () => {
    const checked = boxes.filter((box) => box.checked).length;
    if (status) status.textContent = `${checked}/${boxes.length} ready`;
    if (reset) reset.disabled = checked === 0;
    boxes.forEach((box) => box.closest("label")?.classList.toggle("checked", box.checked));
  };

  boxes.forEach((box, index) => {
    box.checked = Boolean(saved[index]);
    box.addEventListener("change", () => {
      localStorage.setItem(storageKey, JSON.stringify(boxes.map((item) => item.checked)));
      render();
    });
  });

  reset?.addEventListener("click", () => {
    boxes.forEach((box) => {
      box.checked = false;
    });
    localStorage.removeItem(storageKey);
    render();
  });

  render();
})();
