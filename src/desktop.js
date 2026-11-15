const computer = document.querySelector('#computer');
const windowElement = document.querySelector('#desktop-window');
const title = document.querySelector('#window-title');
const toolbar = windowElement.querySelector('.folder-toolbar');
const panels = [...windowElement.querySelectorAll('[data-folder]')];
const zoom = windowElement.querySelector('[data-window-action="zoom"]');
const desktopShortcuts = {
  projects: document.querySelector('#open-projects'),
  experience: document.querySelector('#open-experience')
};
let currentFolder = 'projects';

function setExpanded(expanded) {
  windowElement.classList.toggle('is-expanded', expanded);
  zoom.setAttribute('aria-pressed', String(expanded));
  zoom.title = expanded ? 'Restore size' : 'Expand';
}

export function resetDesktop() {
  windowElement.hidden = true;
  setExpanded(false);
  for (const panel of panels) panel.scrollTop = 0;
  currentFolder = 'projects';
}

function openFolder(folder, returnFrom) {
  const selected = panels.find(panel => panel.dataset.folder === folder);
  if (!selected) return;
  currentFolder = folder;
  windowElement.hidden = false;
  toolbar.hidden = !selected.dataset.parentFolder;
  for (const panel of panels) panel.hidden = panel !== selected;
  const heading = selected.querySelector('h2');
  title.textContent = heading.textContent;
  const focusTarget = returnFrom ? selected.querySelector(`[data-open-folder="${returnFrom}"]`) ?? heading : heading;
  focusTarget.focus({ preventScroll: true });
}

computer.addEventListener('click', event => {
  const shortcut = event.target.closest('[data-open-folder]');
  if (shortcut) {
    openFolder(shortcut.dataset.openFolder, toolbar.contains(shortcut) ? currentFolder : undefined);
    return;
  }
  const control = event.target.closest('[data-window-action]');
  if (!control) return;

  const desktopShortcut = desktopShortcuts[currentFolder] ?? desktopShortcuts.projects;
  switch (control.dataset.windowAction) {
    case 'zoom':
      setExpanded(!windowElement.classList.contains('is-expanded'));
      return;
    case 'close':
      resetDesktop();
      break;
    case 'minimize':
      windowElement.hidden = true;
      break;
  }
  desktopShortcut.focus();
});
