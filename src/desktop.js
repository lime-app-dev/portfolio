const computer = document.querySelector('#computer');
const windowElement = document.querySelector('#desktop-window');
const title = document.querySelector('#window-title');
const toolbar = windowElement.querySelector('.folder-toolbar');
const panels = [...windowElement.querySelectorAll('[data-folder]')];
const zoom = windowElement.querySelector('[data-window-action="zoom"]');
const shareButton = document.querySelector('#copy-window-link');
const shareStatus = document.querySelector('#share-status');
const shareInput = document.querySelector('#share-url');
const folderHashes = new Map([
  ['experience', '#work-experience'],
  ['lime-bundles', '#lime-bundles'],
  ['spread', '#spread']
]);

export function linkedFolder() {
  return [...folderHashes].find(([, hash]) => hash === location.hash)?.[0];
}

export function clearFolderLink() {
  if (linkedFolder()) history.replaceState(null, '', location.pathname + location.search);
}

function updateShareControls(folder) {
  shareButton.hidden = !folderHashes.has(folder);
  shareStatus.hidden = true;
  shareInput.hidden = true;
}

const desktopShortcuts = {
  contact: document.querySelector('#open-contact'),
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
  updateShareControls();
}

export function openFolder(folder, returnFrom) {
  const selected = panels.find(panel => panel.dataset.folder === folder);
  if (!selected) return;
  currentFolder = folder;
  updateShareControls(folder);
  const hash = folderHashes.get(folder);
  if (hash) history.replaceState(null, '', hash);
  else clearFolderLink();
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
  clearFolderLink();
  desktopShortcut.focus();
});

shareButton.addEventListener('click', async () => {
  const folder = currentFolder;
  const url = new URL(location.href);
  url.hash = folderHashes.get(folder);
  try {
    await navigator.clipboard.writeText(url.href);
    if (currentFolder !== folder || windowElement.hidden) return;
    shareStatus.textContent = 'Link copied';
    shareStatus.hidden = false;
  } catch {
    if (currentFolder !== folder || windowElement.hidden) return;
    shareInput.value = url.href;
    shareInput.hidden = false;
    shareInput.select();
  }
});
