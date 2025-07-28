// --- Matrix Text Animation Effect ---
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function matrixEffect(el, finalText, delay = 25, iterations = 3) {
  return new Promise(resolve => {
    let frame = 0;
    const interval = setInterval(() => {
      el.textContent = finalText.split("").map((ch, i) => {
          if (i > frame) return " ";
          if (i < frame - iterations) return ch;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
      frame++;
      if (frame > finalText.length + iterations) {
        clearInterval(interval);
        el.textContent = finalText;
        resolve();
      }
    }, delay);
  });
}

async function runMatrix() {
  await matrixEffect(document.getElementById("who-heading"), "WHO WE ARE", 25);
  await matrixEffect(document.getElementById("who-text"), document.getElementById("who-text").textContent, 10);
  // Removed matrix effect for services heading and individual services
  // await matrixEffect(document.getElementById("services-heading"), "Our Services", 25);
  // const services = document.querySelectorAll("#services li");
  // for(const service of services) { await matrixEffect(service, service.textContent); }
}

function setupGlitchEffect() {
    const heading = document.getElementById('team-heading');
    if (!heading) return;
    const originalText = heading.textContent;
    heading.innerHTML = '';
    const letters = originalText.split('').map(letter => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = letter === ' ' ? '\u00A0' : letter;
        heading.appendChild(span);
        return span;
    });
    setInterval(() => {
        const burstDuration = 1000;
        const glitchIntervalTime = 100;
        const glitchBurstInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * letters.length);
            const randomLetter = letters[randomIndex];
            if(randomLetter) {
                randomLetter.classList.add('letter-glitch');
                setTimeout(() => { randomLetter.classList.remove('letter-glitch'); }, Math.random() * 200 + 50);
            }
        }, glitchIntervalTime);
        setTimeout(() => { clearInterval(glitchBurstInterval); }, burstDuration);
    }, 4000);
}

async function animateInnovationText() {
  const innovationDiv = document.getElementById("matrix-effect");
  const text = innovationDiv.getAttribute("data-text");
  await matrixEffect(innovationDiv, text, 10, 3);
}

function setupTeamScrollAnimation() {
    if (window.innerWidth > 768) return;
    const teamMembers = document.querySelectorAll('.team-member');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
    }, { threshold: 0.5 });
    teamMembers.forEach(member => observer.observe(member));
}

function setupInnovationImageScrollEffect() {
    const innovationImages = document.querySelectorAll('.innovation-image');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.2 });
    innovationImages.forEach(image => observer.observe(image));
}

const matrixSymbol = document.getElementById("matrix-symbol");
setInterval(() => { matrixSymbol.style.opacity = matrixSymbol.style.opacity === "1" ? "0.3" : "1"; }, 500);

const chatIcon = document.getElementById('chat-icon');
const chatbotModal = document.getElementById('chatbot-modal');
const closeChatbotButton = document.getElementById('close-chatbot');
chatIcon.addEventListener('click', () => { chatbotModal.style.display = 'block'; });
closeChatbotButton.addEventListener('click', () => { chatbotModal.style.display = 'none'; });
window.addEventListener('click', (event) => { if (event.target == chatbotModal) { chatbotModal.style.display = 'none'; } });

const fullImageModal = document.getElementById("fullImageModal");
const fullImage = document.getElementById("img01");
const closeFullImageModal = document.getElementsByClassName("close-full-image-modal")[0];
const innovationImageContainers = document.querySelectorAll('.innovation-image'); 
innovationImageContainers.forEach(container => {
    container.addEventListener('click', function() {
        fullImageModal.style.display = "flex";
        fullImage.src = this.querySelector('img').src; 
        fullImage.classList.add('zoomed');
        setTimeout(() => fullImage.classList.remove('zoomed'), 300); 
    });
});
closeFullImageModal.addEventListener('click', () => { fullImageModal.style.display = "none"; });
fullImageModal.addEventListener('click', (event) => { if (event.target === fullImageModal) { fullImageModal.style.display = "none"; } });

function autoScrollInnovationImages() {
    const container = document.getElementById('innovation-carousel');
    if (!container) return;
    let animationFrameId;
    const scroll = () => {
        container.scrollLeft += 0.5;
        if (container.scrollLeft >= (container.scrollWidth - container.clientWidth)) { container.scrollLeft = 0; }
        animationFrameId = requestAnimationFrame(scroll);
    };
    const carouselObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { if (!animationFrameId) { scroll(); } } 
            else { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } }
        });
    }, { threshold: 0.1 });
    carouselObserver.observe(container);
    container.addEventListener('mouseenter', () => { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } });
    container.addEventListener('mouseleave', () => { if (!animationFrameId) { scroll(); } });
    container.addEventListener('touchstart', () => { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } });
    container.addEventListener('touchend', () => { if (!animationFrameId) { scroll(); } });
}

// --- PDB Viewer Script ---
// --- Three.js Global Variables ---
let scene, camera, renderer, controls;
let composer;
let initialCameraPosition = new THREE.Vector3(0, 0, 50);
let initialControlsTarget = new THREE.Vector3(0, 0, 0);
let loadedAtoms = [];
let currentMoleculeGroup;
const MODEL_SCALE_FACTOR = 0.7;

// --- DOM Elements ---
const pdbIdInput = document.getElementById('pdbIdInput');
const loadPdbButton = document.getElementById('loadPdbButton');
const resetViewButton = document.getElementById('resetViewButton');
const pdb3dCanvas = document.getElementById('pdb3dCanvas');
const messageBox = document.getElementById('messageBox');
const loadingOverlay = document.getElementById('loadingOverlay');
const renderModeRadios = document.querySelectorAll('input[name="renderMode"]');
const pdbInfoBox = document.getElementById('pdbInfoBox');
const atomCountInfo = document.getElementById('atomCountInfo');
const ligandCountInfo = document.getElementById('ligandCountInfo');
const ligandList = document.getElementById('ligandList');

// --- Molecular Data Constants ---
const ATOM_RADII_BALL_AND_STICK = {'H':0.25,'C':0.7,'N':0.65,'O':0.6,'S':1,'P':0.95,'F':0.6,'Cl':1,'Br':1.15,'I':1.4,'He':0.5,'Ne':0.7,'Ar':0.9,'Kr':1,'Xe':1.1,'Li':1.45,'Na':1.8,'K':2.2,'Rb':2.35,'Cs':2.6,'Mg':1.5,'Ca':1.8,'Fe':1.25,'Zn':1.35,'UNKNOWN':0.7};
const ATOM_RADII_SPACE_FILLING = {'H':1.2,'C':1.7,'N':1.55,'O':1.52,'S':1.8,'P':1.8,'F':1.47,'Cl':1.75,'Br':1.85,'I':1.98,'He':1.4,'Ne':1.54,'Ar':1.88,'Kr':2.02,'Xe':2.16,'Li':1.82,'Na':2.27,'K':2.75,'Rb':2.95,'Cs':3.43,'Mg':1.73,'Ca':2.31,'Fe':1.25,'Zn':1.39,'UNKNOWN':1.7};
const ATOM_RADII_LINE = {'H':0.1,'C':0.1,'N':0.1,'O':0.1,'S':0.1,'P':0.1,'F':0.1,'Cl':0.1,'Br':0.1,'I':0.1,'He':0.1,'Ne':0.1,'Ar':0.1,'Kr':0.1,'Xe':0.1,'Li':0.1,'Na':0.1,'K':0.1,'Rb':0.1,'Cs':0.1,'Mg':0.1,'Ca':0.1,'Fe':0.1,'Zn':0.1,'UNKNOWN':0.1};
const PYMOL_CPK_COLORS = {'C':0xC0C0C0,'O':0xFF0000,'N':0x0000FF,'S':0xFFFF00,'P':0xFF8C00,'H':0xFFFFFF,'F':0x00FF00,'Cl':0x00FF00,'Br':0x8B4513,'I':0x9400D3,'Fe':0xD2691E,'Zn':0x708090,'Na':0x0000CD,'K':0x8A2BE2,'Ca':0x696969,'Mg':0x006400,'UNKNOWN':0xAAAAAA};
const PDB_VIEWER_ACCENT_COLOR = 0x00f7ff; // Theme-aligned color
const BOND_RADIUS = 0.15 * MODEL_SCALE_FACTOR;
const BOND_THRESHOLD = 1.8;
const LIGAND_COLOR = new THREE.Color(0xFF0000);

Object.keys(ATOM_RADII_BALL_AND_STICK).forEach(k => ATOM_RADII_BALL_AND_STICK[k] *= MODEL_SCALE_FACTOR);
Object.keys(ATOM_RADII_SPACE_FILLING).forEach(k => ATOM_RADII_SPACE_FILLING[k] *= MODEL_SCALE_FACTOR);
Object.keys(ATOM_RADII_LINE).forEach(k => ATOM_RADII_LINE[k] *= MODEL_SCALE_FACTOR);

function initPdbViewer() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    camera = new THREE.PerspectiveCamera(75, pdb3dCanvas.clientWidth / pdb3dCanvas.clientHeight, 0.1, 1000);
    camera.position.copy(initialCameraPosition);
    renderer = new THREE.WebGLRenderer({ canvas: pdb3dCanvas, antialias: true });
    renderer.setSize(pdb3dCanvas.clientWidth, pdb3dCanvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 500;
    controls.target.copy(initialControlsTarget);
    scene.add(new THREE.AmbientLight(0x606060));
    const dirLight1 = new THREE.DirectionalLight(PDB_VIEWER_ACCENT_COLOR, 0.5); // Use theme color
    dirLight1.position.set(1, 1, 1).normalize();
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xFFFFFF, 0.3);
    dirLight2.position.set(-1, -1, -1).normalize();
    scene.add(dirLight2);
    currentMoleculeGroup = new THREE.Group();
    scene.add(currentMoleculeGroup);
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(pdb3dCanvas.clientWidth, pdb3dCanvas.clientHeight), 0.7, 0.3, 0.7));
    window.addEventListener('resize', onWindowResize, false);
    animatePdb();
}

function onWindowResize() {
    const canvasWidth = pdb3dCanvas.clientWidth;
    const canvasHeight = pdb3dCanvas.clientHeight;
    if(canvasWidth > 0 && canvasHeight > 0) {
        renderer.setSize(canvasWidth, canvasHeight);
        camera.aspect = canvasWidth / canvasHeight;
        camera.updateProjectionMatrix();
        composer.setSize(canvasWidth, canvasHeight);
    }
}

function animatePdb() {
    requestAnimationFrame(animatePdb);
    controls.update();
    composer.render();
}

function showMessage(message, isError = false) {
    messageBox.textContent = message;
    messageBox.className = 'mt-4'; // Reset classes
    messageBox.classList.add(isError ? 'text-red-600' : 'text-green-600');
}

function showLoading() { loadingOverlay.classList.remove('hidden'); }
function hideLoading() { loadingOverlay.classList.add('hidden'); }

async function fetchPdbData(pdbId) {
    const url = `https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`PDB ID "${pdbId}" not found or network error.`);
    const text = await response.text();
    if (text.includes("Invalid PDB ID")) throw new Error(`PDB ID "${pdbId}" is invalid.`);
    return text;
}

function parsePdb(pdbText) {
    const atoms = [];
    const ligandsMap = new Map();
    pdbText.split('\n').forEach(line => {
        const recordType = line.substring(0, 6).trim();
        if (recordType === 'ATOM' || recordType === 'HETATM') {
            const x = parseFloat(line.substring(30, 38));
            const y = parseFloat(line.substring(38, 46));
            const z = parseFloat(line.substring(46, 54));
            const element = line.substring(76, 78).trim();
            const resName = line.substring(17, 20).trim();
            if (!isNaN(x)) {
                const isHETATM = (recordType === 'HETATM');
                atoms.push({ x, y, z, element, isHETATM, resName });
                if (isHETATM && resName !== 'HOH') {
                    ligandsMap.set(resName, (ligandsMap.get(resName) || 0) + 1);
                }
            }
        }
    });
    return { atoms, ligands: Array.from(ligandsMap.entries()) };
}

function renderMolecule(atoms, mode) {
    if (currentMoleculeGroup) {
        scene.remove(currentMoleculeGroup);
        currentMoleculeGroup.traverse(child => {
            if(child.geometry) child.geometry.dispose();
            if(child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        });
    }
    currentMoleculeGroup = new THREE.Group();
    scene.add(currentMoleculeGroup);

    let currentAtomRadii, wireframeEnabled = false, renderBondsAsCylinders = false, renderBondsAsLines = false;
    const bondColor = new THREE.Color(0x333333);

    switch (mode) {
        case 'ballAndStick': currentAtomRadii = ATOM_RADII_BALL_AND_STICK; renderBondsAsCylinders = true; break;
        case 'spaceFilling': currentAtomRadii = ATOM_RADII_SPACE_FILLING; break;
        case 'wireframe': currentAtomRadii = ATOM_RADII_BALL_AND_STICK; wireframeEnabled = true; renderBondsAsCylinders = true; break;
        case 'line': currentAtomRadii = ATOM_RADII_LINE; renderBondsAsLines = true; break;
        default: currentAtomRadii = ATOM_RADII_BALL_AND_STICK; renderBondsAsCylinders = true;
    }

    const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    const dummy = new THREE.Object3D();
    const instancedMaterial = wireframeEnabled ? new THREE.MeshBasicMaterial({ color: PDB_VIEWER_ACCENT_COLOR, wireframe: true }) : new THREE.MeshPhongMaterial({ shininess: 50, specular: 0x111111, emissive: 0x101010, vertexColors: true });
    const instancedAtoms = new THREE.InstancedMesh(sphereGeometry, instancedMaterial, atoms.length);
    instancedAtoms.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (!wireframeEnabled) instancedAtoms.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(atoms.length * 3), 3);

    atoms.forEach((atom, i) => {
        const radius = currentAtomRadii[atom.element] || currentAtomRadii['UNKNOWN'];
        const atomColor = atom.isHETATM ? LIGAND_COLOR : new THREE.Color(PYMOL_CPK_COLORS[atom.element] || PYMOL_CPK_COLORS['UNKNOWN']);
        dummy.position.set(atom.x, atom.y, atom.z);
        dummy.scale.set(radius, radius, radius);
        dummy.updateMatrix();
        instancedAtoms.setMatrixAt(i, dummy.matrix);
        if (!wireframeEnabled) atomColor.toArray(instancedAtoms.instanceColor.array, i * 3);
    });
    instancedAtoms.instanceMatrix.needsUpdate = true;
    if (!wireframeEnabled) instancedAtoms.instanceColor.needsUpdate = true;
    currentMoleculeGroup.add(instancedAtoms);

    if (renderBondsAsCylinders || renderBondsAsLines) {
        const bondMaterial = wireframeEnabled ? new THREE.MeshBasicMaterial({ color: PDB_VIEWER_ACCENT_COLOR, wireframe: true }) : new THREE.MeshPhongMaterial({ color: bondColor, shininess: 30, specular: 0x050505 });
        const lineBondMaterial = new THREE.LineBasicMaterial({ color: PDB_VIEWER_ACCENT_COLOR });
        const bondVertices = [];
        for (let i = 0; i < atoms.length; i++) {
            for (let j = i + 1; j < atoms.length; j++) {
                const atom1 = atoms[i], atom2 = atoms[j];
                const dist = Math.sqrt(Math.pow(atom1.x - atom2.x, 2) + Math.pow(atom1.y - atom2.y, 2) + Math.pow(atom1.z - atom2.z, 2));
                if (dist < BOND_THRESHOLD) {
                    if (renderBondsAsCylinders) {
                        const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, dist, 8), bondMaterial);
                        cylinder.position.set((atom1.x + atom2.x) / 2, (atom1.y + atom2.y) / 2, (atom1.z + atom2.z) / 2);
                        const direction = new THREE.Vector3(0, 1, 0); // Default cylinder direction is Y-axis
                        const targetDirection = new THREE.Vector3(atom2.x - atom1.x, atom2.y - atom1.y, atom2.z - atom1.z).normalize();
                        cylinder.quaternion.setFromUnitVectors(direction, targetDirection);
                        currentMoleculeGroup.add(cylinder);
                    } else if (renderBondsAsLines) {
                        bondVertices.push(atom1.x, atom1.y, atom1.z, atom2.x, atom2.y, atom2.z);
                    }
                }
            }
        }
        if (renderBondsAsLines && bondVertices.length > 0) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(bondVertices, 3));
            currentMoleculeGroup.add(new THREE.LineSegments(geometry, lineBondMaterial));
        }
    }

    if (atoms.length > 0) {
        const box = new THREE.Box3().setFromObject(currentMoleculeGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        currentMoleculeGroup.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
        camera.position.set(0, 0, cameraZ);
        controls.target.copy(new THREE.Vector3(0,0,0));
        controls.update();
    } else { resetView(); }
}

async function loadPdb() {
    const pdbId = pdbIdInput.value.trim();
    if (!pdbId) { showMessage('Please enter a PDB ID.', true); return; }
    messageBox.classList.add('hidden');
    showLoading();
    pdbInfoBox.classList.remove('is-visible');
    pdbInfoBox.classList.add('hidden');
    try {
        const pdbText = await fetchPdbData(pdbId);
        const { atoms, ligands } = parsePdb(pdbText);
        loadedAtoms = atoms;
        if (loadedAtoms.length === 0) { showMessage(`No valid atoms found in PDB ID "${pdbId}".`, true); return; }
        const selectedRenderMode = document.querySelector('input[name="renderMode"]:checked').value;
        renderMolecule(loadedAtoms, selectedRenderMode);
        atomCountInfo.textContent = `Total Atoms: ${loadedAtoms.length}`;
        ligandCountInfo.textContent = `Unique Ligands (excluding HOH): ${ligands.length}`;
        ligandList.innerHTML = '';
        if (ligands.length > 0) {
            ligands.forEach(([name, count]) => { ligandList.innerHTML += `<li>${name} (Count: ${count})</li>`; });
        } else { ligandList.innerHTML = '<li>No significant ligands detected.</li>'; }
        pdbInfoBox.classList.remove('hidden');
        pdbInfoBox.classList.add('is-visible');
        showMessage(`PDB ID "${pdbId}" loaded successfully.`, false);
    } catch (error) {
        showMessage(`Error: ${error.message}`, true);
    } finally { hideLoading(); }
}

function resetView() {
    camera.position.copy(initialCameraPosition);
    controls.target.copy(initialControlsTarget);
    controls.update();
}

loadPdbButton.addEventListener('click', loadPdb);
resetViewButton.addEventListener('click', resetView);
renderModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (loadedAtoms.length > 0) {
            renderMolecule(loadedAtoms, radio.value);
            showMessage(`Render mode changed to ${radio.value}.`, false);
        }
    });
});

// --- Removed: Smooth Scrolling for Service Labels ---
// function setupServiceLabelScrolling() {
//     const serviceLabels = document.querySelectorAll('.service-label');
//     serviceLabels.forEach(label => {
//         label.addEventListener('click', function() {
//             const targetId = this.dataset.target;
//             const targetElement = document.getElementById(targetId);
//             const pricingTableContainer = document.querySelector('.pricing-table-container');

//             if (targetElement && pricingTableContainer) {
//                 // Ensure the pricing table is visible before scrolling
//                 pricingTableContainer.classList.remove('hidden');
//                 pricingTableContainer.classList.add('is-visible'); // Add is-visible to trigger animation

//                 // Remove highlight from any previously highlighted row
//                 document.querySelectorAll('.pricing-table tbody tr.highlight').forEach(row => {
//                     row.classList.remove('highlight');
//                 });

//                 targetElement.scrollIntoView({
//                     behavior: 'smooth',
//                     block: 'center' // Scroll to the center of the element
//                 });

//                 // Add highlight to the target row after a short delay
//                 setTimeout(() => {
//                     targetElement.classList.add('highlight');
//                 }, 700); // Adjust delay to match scroll duration
//             }
//         });
//     });
// }

// --- New: Smooth Scrolling for "View All Pricing" Button ---
function setupViewPricingButtonScrolling() {
    const viewPricingButton = document.querySelector('.view-pricing-button');
    const pricingTableContainer = document.querySelector('.pricing-table-container');

    if (viewPricingButton && pricingTableContainer) {
        viewPricingButton.addEventListener('click', function() {
            // Ensure the pricing table is visible
            pricingTableContainer.classList.remove('hidden');
            pricingTableContainer.classList.add('is-visible'); // Add is-visible to trigger animation

            const targetId = this.dataset.target;
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start' // Scroll to the start of the pricing section
                });
                // Remove highlight from any previously highlighted row in the table
                document.querySelectorAll('.pricing-table tbody tr.highlight').forEach(row => {
                    row.classList.remove('highlight');
                });
            }
        });
    }
}


// --- New: Intersection Observer for Pricing Table Fade-in ---
function setupPricingTableObserver() {
    const pricingTableContainer = document.querySelector('.pricing-table-container');
    if (!pricingTableContainer) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If it becomes visible, add the is-visible class to trigger animation
                pricingTableContainer.classList.add('is-visible');
                observer.unobserve(pricingTableContainer); // Stop observing once visible
            }
        });
    }, {
        threshold: 0.2 // Trigger when 20% of the element is visible
    });

    // Only observe if it's currently hidden (display: none)
    // If it's already visible (e.g., after button click), the observer will trigger immediately
    if (pricingTableContainer.classList.contains('hidden')) {
        observer.observe(pricingTableContainer);
    } else {
        // If it's not hidden, ensure it gets the 'is-visible' class immediately
        pricingTableContainer.classList.add('is-visible');
    }
}


// --- Window Onload Logic (MERGED) ---
window.onload = () => {
  // From original index.html
  // Removed runMatrix().then(() => animateInnovationText()); from here
  runMatrix(); // Call runMatrix without the .then() for animateInnovationText
  animateInnovationText(); // Call animateInnovationText directly
  setupTeamScrollAnimation();
  setupGlitchEffect();
  setupInnovationImageScrollEffect();
  autoScrollInnovationImages();

  // From pdbviewer.html
  initPdbViewer();

  // New functions
  // Removed setupServiceLabelScrolling();
  setupViewPricingButtonScrolling(); // Initialize the new button's scrolling
  setupPricingTableObserver(); // Initialize the observer for fade-in

  // Vanta background
  VANTA.NET({
    el: document.body,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x00f7ff,
    backgroundColor: 0x000000,
    points: 15.00,
    maxDistance: 14.00,
    spacing: 18.00
  });
};
