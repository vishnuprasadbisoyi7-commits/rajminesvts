
// Common script for sidebar active state and tab behavior
function initializePage(pageId){
  renderSidebar();
  setActiveFromPath(pageId);
  renderHeader();
  restoreModuleState(pageId);
}

// Sidebar uses window.location.pathname to set active link (simple emulation)
// If pages are viewed from file system, location.pathname ends with the filename.
function renderSidebar(){
  const sidebar = document.querySelectorAll('.sidebar')[0];
  if(!sidebar) return;
  
  // Menu structure
  const menuStructure = [
    {
      id: 'index',
      title: 'Dashboard',
      file: 'index.html',
      type: 'link'
    },
    {
      id: 'vendor',
      title: 'Vendor Enrollment',
      file: 'vendor.html',
      type: 'link'
    },
    {
      id: 'device',
      title: 'Device Tagging',
      type: 'section',
      children: [
        {id: 'device-registered', title: 'Registered Device', file: 'device.html', hash: ''},
        {id: 'device-fitment', title: 'Fit & Activate', file: 'device.html', hash: 'fitment'}
      ]
    },
    {
      id: 'geofence',
      title: 'Geo-Fencing',
      file: 'geofence.html',
      type: 'link'
    },
    {
      id: 'tracking',
      title: 'End-to-End Tracking',
      file: 'tracking.html',
      type: 'link'
    }
  ];
  
  // clear existing
  sidebar.innerHTML = '';
  
  // add header
  const h = document.createElement('div');
  h.className = 'sidebar-header';
  h.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;width:100%;">
      <div style="background:#e3f2fd;padding:8px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <img src="https://mines.rajasthan.gov.in/dmgcms/Static/website/images/logo_img.png" alt="DMG Logo" style="height:50px;width:50px;object-fit:contain;">
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:800;font-size:16px;color:var(--teal);">Rajmines</div>
        <div class="small" style="margin-top:2px;">VTS – DMG</div>
        <div class="small" style="margin-top:2px;">Rajasthan</div>
      </div>
    </div>
  `;
  sidebar.appendChild(h);
  
  // create nav
  const nav = document.createElement('nav');
  nav.className = 'sidebar-nav';
  
  menuStructure.forEach(item => {
    if(item.type === 'link') {
      // Simple link item
      const linkItem = createMenuItem(item);
      nav.appendChild(linkItem);
    } else if(item.type === 'section') {
      // Expandable section
      const section = createExpandableSection(item);
      nav.appendChild(section);
    }
  });
  
  sidebar.appendChild(nav);
  
  // Set active based on pathname and hash
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const hash = window.location.hash.replace('#', '');
  setActiveMenuItem(path, hash);
  
  // Restore expanded state from sessionStorage
  restoreExpandedSections();
}

function createMenuItem(item) {
  const a = document.createElement('a');
  a.href = item.file + (item.hash ? '#' + item.hash : '');
  a.className = 'sidebar-link';
  a.dataset.id = item.id;
  a.dataset.file = item.file;
  a.dataset.hash = item.hash || '';
  a.innerHTML = `<span>${item.title}</span>`;
  // Add click handler to set active state and reset to default tab
  a.addEventListener('click', function(e) {
    // Remove active from all links
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
    });
    // Add active to clicked link
    this.classList.add('active');
    // Set fresh nav flag to reset to default 'add' tab
    sessionStorage.setItem('freshNav', 'true');
    // Clear stored tab for this module to force default
    const moduleId = this.dataset.id;
    if(moduleId && moduleId !== 'index') {
      sessionStorage.removeItem('tab_' + moduleId);
    }
  });
  return a;
}

function createExpandableSection(section) {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = 'sidebar-section';
  sectionDiv.dataset.id = section.id;
  
  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'sidebar-section-header';
  sectionHeader.innerHTML = `
    <span class="sidebar-section-title">${section.title}</span>
    <span class="sidebar-chevron">▼</span>
  `;
  
  const sectionContent = document.createElement('div');
  sectionContent.className = 'sidebar-section-content';
  sectionContent.style.display = 'none';
  
  section.children.forEach(child => {
    const childLink = document.createElement('a');
    childLink.href = child.file + (child.hash ? '#' + child.hash : '');
    childLink.className = 'sidebar-link sidebar-sublink';
    childLink.dataset.id = child.id;
    childLink.dataset.file = child.file;
    childLink.dataset.hash = child.hash || '';
    childLink.innerHTML = `<span>${child.title}</span>`;
    // Add click handler to set active state and reset to default tab
    childLink.addEventListener('click', function(e) {
      // Remove active from all links
      document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
      });
      // Add active to clicked link
      this.classList.add('active');
      // Set fresh nav flag to reset to default 'add' tab
      sessionStorage.setItem('freshNav', 'true');
      // Clear stored tab for this module to force default
      const moduleId = this.dataset.id;
      if(moduleId) {
        // Extract base module ID (e.g., 'device' from 'device-registered')
        const baseModuleId = moduleId.split('-')[0];
        sessionStorage.removeItem('tab_' + baseModuleId);
        if(baseModuleId === 'device') {
          // Also clear fitment tab if it's a device sub-link
          sessionStorage.removeItem('tab_fitment');
        }
      }
    });
    sectionContent.appendChild(childLink);
  });
  
  sectionHeader.addEventListener('click', () => {
    const isExpanded = sectionContent.style.display !== 'none';
    sectionContent.style.display = isExpanded ? 'none' : 'block';
    const chevron = sectionHeader.querySelector('.sidebar-chevron');
    chevron.textContent = isExpanded ? '▼' : '▲';
    // Save expanded state
    sessionStorage.setItem(`sidebar_${section.id}_expanded`, !isExpanded);
  });
  
  sectionDiv.appendChild(sectionHeader);
  sectionDiv.appendChild(sectionContent);
  
  return sectionDiv;
}

function setActiveMenuItem(activeFile, activeHash) {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const file = link.dataset.file;
    const hash = link.dataset.hash || '';
    // Match if file matches and (hash matches OR both are empty)
    const isActive = file === activeFile && (hash === activeHash || (hash === '' && (activeHash === '' || activeHash === 'registered')));
    
    if(isActive) {
      link.classList.add('active');
      // Expand parent section if it's a sublink
      if(link.classList.contains('sidebar-sublink')) {
        const section = link.closest('.sidebar-section');
        if(section) {
          const content = section.querySelector('.sidebar-section-content');
          const header = section.querySelector('.sidebar-section-header');
          const chevron = header.querySelector('.sidebar-chevron');
          content.style.display = 'block';
          chevron.textContent = '▲';
          sessionStorage.setItem(`sidebar_${section.dataset.id}_expanded`, 'true');
        }
      }
    } else {
      link.classList.remove('active');
    }
  });
}

function restoreExpandedSections() {
  document.querySelectorAll('.sidebar-section').forEach(section => {
    const sectionId = section.dataset.id;
    const isExpanded = sessionStorage.getItem(`sidebar_${sectionId}_expanded`) === 'true';
    const content = section.querySelector('.sidebar-section-content');
    const chevron = section.querySelector('.sidebar-chevron');
    if(isExpanded) {
      content.style.display = 'block';
      chevron.textContent = '▲';
    }
  });
}

// header rendering small helper
function renderHeader(){
  // Header text is already set in HTML, no need to override
  const last = sessionStorage.getItem('lastVisited') || '—';
  const lastEl = document.getElementById('lastVisited');
  if(lastEl) lastEl.textContent = 'Last: ' + last;
  // reset button
  const resetBtn = document.getElementById('resetBtn');
  if(resetBtn) resetBtn.onclick = ()=>{ localStorage.clear(); sessionStorage.clear(); alert('Stored data cleared.'); location.reload(); };
}

// Tabs logic: stores active tab for each module in sessionStorage (resets when browser closed)
function setActiveTab(moduleId, tabName){
  sessionStorage.setItem('tab_' + moduleId, tabName);
}
function getActiveTab(moduleId){
  // Check if this is a fresh navigation (not from tab click)
  const isFreshNav = sessionStorage.getItem('freshNav') === 'true';
  if(isFreshNav) {
    // Reset fresh nav flag
    sessionStorage.removeItem('freshNav');
    // Return default 'add' tab for fresh navigation
    const defaults = {
      'vendor': 'add',
      'device': 'add',
      'geofence': 'list',
      'tracking': 'live',
      'fitment': 'fitment-add'
    };
    return defaults[moduleId] || 'add';
  }
  const stored = sessionStorage.getItem('tab_' + moduleId);
  if(stored) return stored;
  // Default tabs per module
  const defaults = {
    'vendor': 'add',
    'device': 'add',
    'geofence': 'list',
    'tracking': 'live',
    'fitment': 'fitment-add'
  };
  return defaults[moduleId] || 'add';
}

// Per-page module restore
function restoreModuleState(moduleId){
  // update header title
  const title = document.getElementById('pageTitle');
  const breadcrumb = document.getElementById('breadcrumb');
  if(title) title.textContent = (moduleId==='index'?'Dashboard': capitalize(moduleId.replace(/-/g,' ')));
  if(breadcrumb) breadcrumb.textContent = 'Home / ' + (moduleId==='index'?'Dashboard': capitalize(moduleId.replace(/-/g,' ')));
  // set last visited
  sessionStorage.setItem('lastVisited', moduleId);
  localStorage.setItem('raj_lastVisited', moduleId); // optional persistent marker
  const lastEl = document.getElementById('lastVisited');
  if(lastEl) lastEl.textContent = 'Last: ' + moduleId;

  // If page has tabs, restore selected tab and handle content switching
  // Handle tabs within each card section separately
  const cardSections = document.querySelectorAll('.card');
  cardSections.forEach(card => {
    const tabs = card.querySelectorAll('[data-tab]');
    // Skip title cards (cards without tabs or with only page-title)
    if(tabs && tabs.length > 0 && !card.querySelector('.page-title')) {
      // Determine which section this is
      const isFitmentSection = card.querySelector('#fitment-add') !== null || card.querySelector('[id^="fitment-"]') !== null;
      const sectionPrefix = isFitmentSection ? 'fitment' : moduleId;
      const defaultTab = isFitmentSection ? 'fitment-add' : getActiveTab(moduleId);
      
      // Show/hide tab content based on active tab
      function showTabContent(tabName) {
        // Hide all tab contents in this card
        card.querySelectorAll('.tab-content').forEach(el => {
          el.classList.remove('active');
        });
        // Show the selected tab content - try moduleId-tabName pattern first
        let contentEl = card.querySelector(`#${sectionPrefix}-${tabName}`);
        // If not found, try just tabName (for backward compatibility)
        if(!contentEl) {
          contentEl = card.querySelector(`#${tabName}`);
        }
        // If still not found, search in parent device-section if exists
        if(!contentEl) {
          const parentSection = card.closest('.device-section');
          if(parentSection) {
            contentEl = parentSection.querySelector(`#${sectionPrefix}-${tabName}`) || parentSection.querySelector(`#${tabName}`);
          }
        }
        if(contentEl) {
          contentEl.classList.add('active');
        }
      }
      
      // Set initial active tab
      let activeTabSet = false;
      tabs.forEach(t=>{
        const tabName = t.dataset.tab;
        const storedTab = isFitmentSection ? getActiveTab('fitment') : getActiveTab(moduleId);
        const shouldBeActive = tabName === storedTab || (!activeTabSet && tabName === defaultTab);
        
        if(shouldBeActive) {
          t.classList.add('active');
          showTabContent(tabName);
          activeTabSet = true;
        } else {
          t.classList.remove('active');
        }
        
        t.onclick = ()=>{
          // Remove active from all tabs in this card
          tabs.forEach(x=>x.classList.remove('active'));
          t.classList.add('active');
          const clickedTabName = t.dataset.tab;
          if(isFitmentSection) {
            setActiveTab('fitment', clickedTabName);
          } else {
            setActiveTab(moduleId, clickedTabName);
          }
          showTabContent(clickedTabName);
        };
      });
    }
  });

  // Form reset on load (clears fields)
  document.querySelectorAll('form').forEach(f=>f.reset());
}

function setActiveFromPath(fallback){
  // fallback is page id from onload param
  const path = window.location.pathname.split('/').pop() || '';
  if(!path) return;
  const name = path.replace('.html','') || fallback || 'index';
  // expose window.pageModule for other scripts
  window.pageModule = name;
}

function capitalize(s){ return s.replace(/\b\w/g,c=>c.toUpperCase()); }

// Toggle sidebar function
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if(sidebar) {
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
  }
}

window.initializePage = initializePage;
window.toggleSidebar = toggleSidebar;
