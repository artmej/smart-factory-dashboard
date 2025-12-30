// 🏭 Smart Factory 3D Digital Twins - Three.js Implementation
// Case Study #36 - Phase 3: Immersive 3D Visualization

class SmartFactory3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.machines = {};
        this.sensors = {};
        this.socket = null;
        this.selectedMachine = null;
        this.animationId = null;
        
        this.init();
    }
    
    // 🚀 Initialize 3D Scene
    init() {
        console.log('🏭 Initializing Smart Factory 3D...');
        
        this.setupScene();
        this.setupLighting();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        
        // Load demo data immediately instead of waiting for socket
        this.createDemoLayout();
        
        // Try socket connection but don't wait for it
        this.setupSocketConnection();
        
        // Hide loading screen after 1 second
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
        }, 1000);
        
        this.animate();
    }
    
    // 🌎 Setup Scene
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);
        
        // 🏢 Factory Floor
        const floorGeometry = new THREE.PlaneGeometry(30, 25);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        this.scene.add(floor);
        
        // 🏢 Factory Walls
        this.createFactoryWalls();
        
        // ✨ Grid Helper
        const gridHelper = new THREE.GridHelper(30, 20, 0x00ff88, 0x444444);
        gridHelper.position.y = -0.9;
        this.scene.add(gridHelper);
    }
    
    // 🏢 Create Factory Walls
    createFactoryWalls() {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c2c54,
            transparent: true,
            opacity: 0.6
        });
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 8),
            wallMaterial
        );
        backWall.position.set(0, 3, -12.5);
        this.scene.add(backWall);
        
        // Side walls
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(25, 8),
            wallMaterial
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-15, 3, 0);
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(25, 8),
            wallMaterial
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(15, 3, 0);
        this.scene.add(rightWall);
    }
    
    // 💡 Setup Lighting
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Factory accent lighting
        const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 20);
        pointLight1.position.set(-10, 5, -5);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff6b6b, 0.3, 15);
        pointLight2.position.set(10, 4, 8);
        this.scene.add(pointLight2);
        
        // Overhead industrial lighting
        for (let i = -2; i <= 2; i++) {
            for (let j = -1; j <= 1; j++) {
                const light = new THREE.PointLight(0xffffff, 0.2, 12);
                light.position.set(i * 8, 6, j * 8);
                this.scene.add(light);
            }
        }
    }
    
    // 📸 Setup Camera
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / (window.innerHeight - 80),
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 15);
        this.camera.lookAt(0, 0, 0);
    }
    
    // 🖥️ Setup Renderer
    setupRenderer() {
        const container = document.getElementById('canvas-container');
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight - 80);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x1a1a2e);
        
        container.appendChild(this.renderer.domElement);
    }
    
    // 🎮 Setup Controls
    setupControls() {
        try {
            if (typeof THREE.OrbitControls !== 'undefined') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.maxPolarAngle = Math.PI / 2;
                this.controls.minDistance = 5;
                this.controls.maxDistance = 30;
                console.log('✅ OrbitControls initialized successfully');
            } else {
                console.warn('⚠️ OrbitControls not available, using basic camera');
                // Basic mouse controls as fallback
                this.setupBasicControls();
            }
        } catch (error) {
            console.error('❌ Error setting up controls:', error);
            console.warn('⚠️ Falling back to basic camera controls');
            this.setupBasicControls();
        }
    }
    
    // 🎮 Basic Controls Fallback
    setupBasicControls() {
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            // Basic camera rotation
            this.camera.position.x = this.camera.position.x * Math.cos(deltaX * 0.01) - this.camera.position.z * Math.sin(deltaX * 0.01);
            this.camera.position.z = this.camera.position.x * Math.sin(deltaX * 0.01) + this.camera.position.z * Math.cos(deltaX * 0.01);
            this.camera.position.y += deltaY * 0.05;
            
            this.camera.lookAt(0, 0, 0);
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        console.log('✅ Basic camera controls initialized');
    }
    
    // 🏭 Create Demo Factory Layout with Production Lines
    createDemoLayout() {
        console.log('🔧 Creating realistic production lines...');
        
        // Production Line A - Automotive Parts
        this.createProductionLine('A', 'Automotive Parts', [
            { id: 'MACHINE_A1', name: 'Stamping Press A1', type: 'stamping', status: 'running' },
            { id: 'MACHINE_A2', name: 'Welding Station A2', type: 'welding', status: 'running' },
            { id: 'MACHINE_A3', name: 'Assembly Unit A3', type: 'assembly', status: 'maintenance' },
            { id: 'MACHINE_A4', name: 'Quality Check A4', type: 'quality', status: 'stopped' }
        ], -6, 'red');
        
        // Production Line B - Electronics
        this.createProductionLine('B', 'Electronics', [
            { id: 'MACHINE_B1', name: 'CNC Mill B1', type: 'cnc', status: 'running' },
            { id: 'MACHINE_B2', name: 'Lathe B2', type: 'lathe', status: 'offline' },
            { id: 'MACHINE_B3', name: 'Drill Press B3', type: 'drill', status: 'stopped' },
            { id: 'MACHINE_B4', name: 'Grinding Unit B4', type: 'grinding', status: 'stopped' }
        ], 0, 'orange');
        
        // Production Line C - Consumer Goods
        this.createProductionLine('C', 'Consumer Goods', [
            { id: 'MACHINE_C1', name: 'Injection Molder C1', type: 'molding', status: 'running' },
            { id: 'MACHINE_C2', name: 'Cooling Station C2', type: 'cooling', status: 'running' },
            { id: 'MACHINE_C3', name: 'Trimming Unit C3', type: 'trimming', status: 'running' },
            { id: 'MACHINE_C4', name: 'Packaging Line C4', type: 'packaging', status: 'running' }
        ], 6, 'green');
        
        // Enhanced conveyor system
        this.createEnhancedConveyorSystem();
        
        // Update machine list UI
        this.updateMachineListUI();
        
        console.log(`✅ Created 3 production lines with ${Object.keys(this.machines).length} machines`);
    }
    
    // 🏭 Create Production Line
    createProductionLine(lineId, lineName, machinesConfig, zPosition, lineColor) {
        console.log(`🔧 Creating ${lineName} (Line ${lineId})...`);
        
        // Calculate line status based on machines
        const lineStatus = this.calculateLineStatus(machinesConfig);
        
        // Create line header
        this.createLineHeader(lineId, lineName, lineStatus, zPosition);
        
        // Create machines in line
        machinesConfig.forEach((config, index) => {
            const xPosition = -8 + (index * 5);
            const machineStatus = lineStatus === 'stopped' ? 'stopped' : config.status;
            const color = this.getMachineColor(machineStatus);
            
            this.createMachine(
                config.id, 
                config.name, 
                xPosition, 
                0, 
                zPosition, 
                machineStatus, 
                color,
                config.type,
                lineId
            );
        });
        
        // Create line-specific conveyor
        this.createLineConveyor(lineId, zPosition, lineColor, lineStatus);
        
        // Store line info
        this.productionLines = this.productionLines || {};
        this.productionLines[lineId] = {
            id: lineId,
            name: lineName,
            status: lineStatus,
            machines: machinesConfig.map(m => m.id),
            color: lineColor,
            position: zPosition
        };
    }
    
    // 📊 Calculate Line Status (Business Logic)
    calculateLineStatus(machinesConfig) {
        const statuses = machinesConfig.map(m => m.status);
        
        // Business rule: If any machine is offline/maintenance, entire line stops
        if (statuses.includes('offline') || statuses.includes('maintenance')) {
            return 'stopped';
        }
        
        // If all running, line is running
        if (statuses.every(s => s === 'running')) {
            return 'running';
        }
        
        // Mixed states = line issues
        return 'warning';
    }
    
    // 🎨 Get Machine Color Based on Status
    getMachineColor(status) {
        const colors = {
            'running': 0x00ff88,     // Green
            'maintenance': 0xffa502, // Orange  
            'offline': 0xff4757,     // Red
            'stopped': 0x666666      // Gray (stopped due to line)
        };
        return colors[status] || 0x888888;
    }
    
    // 🏷️ Create Line Header
    createLineHeader(lineId, lineName, lineStatus, zPosition) {
        // Line status indicator
        const statusGeometry = new THREE.BoxGeometry(12, 0.3, 0.5);
        const statusColor = lineStatus === 'running' ? 0x00ff88 : 
                           lineStatus === 'warning' ? 0xffa502 : 0xff4757;
        const statusMaterial = new THREE.MeshStandardMaterial({
            color: statusColor,
            emissive: statusColor,
            emissiveIntensity: 0.3
        });
        const statusIndicator = new THREE.Mesh(statusGeometry, statusMaterial);
        statusIndicator.position.set(0, 2.5, zPosition);
        this.scene.add(statusIndicator);
        
        // Line nameplate
        this.createLineNameplate(`${lineName} - ${lineStatus.toUpperCase()}`, 0, 3, zPosition, statusColor);
    }
    
    // 🏷️ Create Line Nameplate
    createLineNameplate(text, x, y, z, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        context.fillStyle = '#000000';
        context.fillRect(0, 0, 512, 128);
        context.font = 'Bold 24px Arial';
        context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.textAlign = 'center';
        context.fillText(text, 256, 80);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        
        const geometry = new THREE.PlaneGeometry(4, 1);
        const nameplate = new THREE.Mesh(geometry, material);
        nameplate.position.set(x, y, z);
        this.scene.add(nameplate);
    }
    
    // 🚚 Create Line Conveyor
    createLineConveyor(lineId, zPosition, lineColor, lineStatus) {
        const beltMaterial = new THREE.MeshStandardMaterial({
            color: lineStatus === 'running' ? 0x654321 : 0x333333,
            metalness: 0.1,
            roughness: 0.9
        });
        
        // Main conveyor belt
        for (let segment = 0; segment < 5; segment++) {
            const x = -10 + segment * 5;
            const beltGeometry = new THREE.BoxGeometry(4, 0.15, 1.2);
            const belt = new THREE.Mesh(beltGeometry, beltMaterial);
            belt.position.set(x, -0.4, zPosition);
            belt.receiveShadow = true;
            this.scene.add(belt);
            
            // Moving material simulation (only if line is running)
            if (lineStatus === 'running') {
                this.animateConveyor(belt, segment * 0.5);
            }
        }
        
        // Line connection pipes/cables
        this.createLineConnections(zPosition, lineColor);
    }
    createMachine(id, name, x, y, z, status = 'running', color = 0x00ff88, type = 'generic', lineId = '') {
        const group = new THREE.Group();
        
        // Main machine body
        const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 1.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.7,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.75, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Machine base
        const baseGeometry = new THREE.BoxGeometry(2.5, 0.2, 2);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.8,
            roughness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, -0.9, 0);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Control panel
        const panelGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.1);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.5,
            roughness: 0.5
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(1, 0.4, 0.8);
        group.add(panel);
        
        // Status indicator light
        const lightGeometry = new THREE.SphereGeometry(0.05, 8, 6);
        let lightColor = 0x00ff00; // green
        if (status === 'maintenance') lightColor = 0xffaa00; // orange
        if (status === 'offline') lightColor = 0xff0000; // red
        
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: lightColor,
            emissive: lightColor,
            emissiveIntensity: 0.5
        });
        const statusLight = new THREE.Mesh(lightGeometry, lightMaterial);
        statusLight.position.set(1.1, 0.8, 0.85);
        group.add(statusLight);
        
        // Machine nameplate
        this.createNameplate(group, name, 0, 1.8, 0);
        
        // Position the entire group
        group.position.set(x, y, z);
        
        // Add click interaction
        body.userData = { type: 'machine', id: id, name: name };
        
        this.scene.add(group);
        
        // Store machine data
        this.machines[id] = {
            id: id,
            name: name,
            status: status,
            group: group,
            body: body,
            statusLight: statusLight,
            position: { x, y, z },
            temperature: Math.random() * 50 + 50,
            vibration: Math.random() * 10,
            efficiency: Math.random() * 30 + 70,
            lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            nextMaintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
        };
        
        // Random animation for running machines
        if (status === 'running') {
            this.animateMachine(group);
        }
    }
    
    // 🏷️ Create Nameplate
    createNameplate(parent, text, x, y, z) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = '#000000';
        context.fillRect(0, 0, 256, 64);
        context.font = 'Bold 16px Arial';
        context.fillStyle = '#00ff88';
        context.textAlign = 'center';
        context.fillText(text, 128, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        
        const geometry = new THREE.PlaneGeometry(1.5, 0.375);
        const nameplate = new THREE.Mesh(geometry, material);
        nameplate.position.set(x, y, z);
        
        parent.add(nameplate);
    }
    
    // 🎬 Animate Machine
    animateMachine(group) {
        const originalY = group.position.y;
        let time = Math.random() * Math.PI * 2;
        
        const animate = () => {
            time += 0.02;
            group.position.y = originalY + Math.sin(time) * 0.05;
            group.rotation.y = Math.sin(time * 0.5) * 0.02;
            
            setTimeout(() => animate(), 50);
        };
        
        animate();
    }
    
    // 🚚 Create Conveyor Belts
    createConveyorBelts() {
        const beltMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            metalness: 0.1,
            roughness: 0.9
        });
        
        // Horizontal belts
        for (let line = 0; line < 3; line++) {
            const z = (line - 1) * 6;
            for (let segment = 0; segment < 4; segment++) {
                const x = -6 + segment * 4;
                const beltGeometry = new THREE.BoxGeometry(3, 0.1, 0.8);
                const belt = new THREE.Mesh(beltGeometry, beltMaterial);
                belt.position.set(x, -0.45, z);
                belt.receiveShadow = true;
                this.scene.add(belt);
            }
        }
    }
    
    // 🔌 Setup Socket Connection
    setupSocketConnection() {
        try {
            // Try to connect to WebSocket server
            this.socket = new WebSocket('ws://localhost:3001');
            
            this.socket.onopen = () => {
                console.log('🔌 Connected to factory data server');
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleRealtimeData(data);
                } catch (error) {
                    console.warn('⚠️ Invalid WebSocket data:', error);
                }
            };
            
            this.socket.onclose = () => {
                console.log('🔌 Disconnected from factory data server');
                // Try to reconnect after 5 seconds
                setTimeout(() => this.setupSocketConnection(), 5000);
            };
            
            this.socket.onerror = (error) => {
                console.log('🔌 WebSocket connection failed, using demo data');
            };
        } catch (error) {
            console.log('🔌 No WebSocket server available, using demo data');
        }
    }
    
    // 📡 Handle Realtime Data
    handleRealtimeData(data) {
        if (data.type === 'machineStatus' && this.machines[data.machineId]) {
            const machine = this.machines[data.machineId];
            machine.status = data.status;
            machine.temperature = data.temperature || machine.temperature;
            machine.vibration = data.vibration || machine.vibration;
            machine.efficiency = data.efficiency || machine.efficiency;
            
            this.updateMachineVisualStatus(data.machineId, data.status);
            this.updateMachineListUI();
        }
        
        if (data.type === 'alert') {
            this.showAlert(data.message);
        }
    }
    
    // 🎨 Update Machine Visual Status
    updateMachineVisualStatus(machineId, status) {
        const machine = this.machines[machineId];
        if (!machine) return;
        
        let color = 0x00ff00; // green
        if (status === 'maintenance') color = 0xffaa00; // orange
        if (status === 'offline') color = 0xff0000; // red
        
        machine.statusLight.material.color.setHex(color);
        machine.statusLight.material.emissive.setHex(color);
        
        // Update body color slightly
        const bodyColor = status === 'running' ? 0x00ff88 : 
                         status === 'maintenance' ? 0xffa502 : 0xff4757;
        machine.body.material.color.setHex(bodyColor);
        
        // Update UI
        if (typeof updateMachineStatus === 'function') {
            updateMachineStatus(machineId, status, machine);
        }
    }
    
    // 📋 Update Machine List UI
    updateMachineListUI() {
        const machineList = document.getElementById('machine-list');
        if (!machineList) return;
        
        machineList.innerHTML = '';
        
        Object.values(this.machines).forEach(machine => {
            const item = document.createElement('div');
            item.className = 'machine-item';
            item.id = `machine-${machine.id}`;
            item.onclick = () => this.selectMachine(machine.id);
            
            const statusClass = `status-${machine.status.toLowerCase()}`;
            
            item.innerHTML = `
                <div class="machine-name">
                    <span class="status-indicator ${statusClass}"></span>
                    ${machine.name}
                </div>
                <div class="machine-status ${statusClass}">
                    Estado: ${machine.status}
                </div>
                <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">
                    Temp: ${machine.temperature.toFixed(1)}°C | 
                    Efic: ${machine.efficiency.toFixed(1)}%
                </div>
            `;
            
            machineList.appendChild(item);
        });
    }
    
    // 🎯 Select Machine
    selectMachine(machineId) {
        // Deselect previous machine
        if (this.selectedMachine && this.machines[this.selectedMachine]) {
            this.machines[this.selectedMachine].body.material.emissive.setHex(0x000000);
        }
        
        // Select new machine
        this.selectedMachine = machineId;
        const machine = this.machines[machineId];
        
        if (machine) {
            // Highlight selected machine
            machine.body.material.emissive.setHex(0x666666);
            
            // Move camera to machine
            this.focusOnMachine(machine);
            
            // Show machine info
            this.showMachineInfo(machine);
            
            console.log(`🎯 Selected machine: ${machine.name}`);
        }
    }
    
    // 📸 Focus Camera on Machine
    focusOnMachine(machine) {
        const pos = machine.position;
        const targetPosition = new THREE.Vector3(pos.x, pos.y + 5, pos.z + 8);
        const targetLookAt = new THREE.Vector3(pos.x, pos.y, pos.z);
        
        // Smooth camera transition
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        
        let progress = 0;
        const animateCamera = () => {
            progress += 0.05;
            
            if (progress <= 1) {
                this.camera.position.lerpVectors(startPosition, targetPosition, progress);
                if (this.controls && this.controls.target) {
                    this.controls.target.lerpVectors(startTarget, targetLookAt, progress);
                    this.controls.update();
                } else {
                    this.camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z);
                }
                
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }
    
    // 📊 Show Machine Info
    showMachineInfo(machine) {
        const infoPanel = document.getElementById('machine-info-panel');
        const infoTitle = document.getElementById('machine-info-title');
        const infoContent = document.getElementById('machine-info-content');
        
        if (!infoPanel || !infoTitle || !infoContent) return;
        
        infoTitle.textContent = `📊 ${machine.name}`;
        
        const lastMaintenance = machine.lastMaintenance.toLocaleDateString();
        const nextMaintenance = machine.nextMaintenance.toLocaleDateString();
        
        infoContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <strong>🔧 Estado:</strong><br>
                    <span class="status-${machine.status.toLowerCase()}">${machine.status}</span>
                </div>
                <div>
                    <strong>🌡️ Temperatura:</strong><br>
                    ${machine.temperature.toFixed(1)}°C
                </div>
                <div>
                    <strong>📊 Eficiencia:</strong><br>
                    ${machine.efficiency.toFixed(1)}%
                </div>
                <div>
                    <strong>📳 Vibración:</strong><br>
                    ${machine.vibration.toFixed(2)} Hz
                </div>
                <div>
                    <strong>🔧 Último Mantenimiento:</strong><br>
                    ${lastMaintenance}
                </div>
                <div>
                    <strong>📅 Próximo Mantenimiento:</strong><br>
                    ${nextMaintenance}
                </div>
            </div>
        `;
        
        infoPanel.style.display = 'block';
    }
    
    // 🚨 Show Alert
    showAlert(message) {
        if (typeof showAlert === 'function') {
            showAlert(message);
        } else {
            console.warn(`⚠️ Alert: ${message}`);
        }
    }
    
    // 🎬 Animation Loop
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
        
        // Update machine animations
        Object.values(this.machines).forEach(machine => {
            if (machine.status === 'running') {
                // Subtle status light pulsing
                const time = Date.now() * 0.005;
                machine.statusLight.material.emissiveIntensity = 0.3 + Math.sin(time) * 0.1;
            }
        });
    }
    
    // 📱 Handle Window Resize
    handleWindowResize() {
        this.camera.aspect = window.innerWidth / (window.innerHeight - 80);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight - 80);
    }
    
    // 🧹 Cleanup
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.socket) {
            this.socket.close();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        console.log('🧹 Smart Factory 3D cleaned up');
    }
    
    // 🚚 Create Line Connections
    createLineConnections(zPosition, lineColor) {
        // Overhead power/data cables
        const cableGeometry = new THREE.CylinderGeometry(0.05, 0.05, 15, 8);
        const cableMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const cable = new THREE.Mesh(cableGeometry, cableMaterial);
        cable.rotation.z = Math.PI / 2;
        cable.position.set(0, 4, zPosition);
        this.scene.add(cable);
    }
    
    // 🔄 Animate Conveyor Belt
    animateConveyor(belt, offset) {
        let time = offset;
        const animate = () => {
            time += 0.02;
            belt.material.map && (belt.material.map.offset.x = time * 0.1);
            setTimeout(() => animate(), 100);
        };
        animate();
    }
    
    // 🚚 Create Enhanced Conveyor System
    createEnhancedConveyorSystem() {
        // Main distribution conveyor (horizontal)
        const mainConveyorGeometry = new THREE.BoxGeometry(20, 0.2, 0.8);
        const mainConveyorMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.3,
            roughness: 0.7
        });
        
        for (let line = 0; line < 3; line++) {
            const z = (line - 1) * 6;
            const mainConveyor = new THREE.Mesh(mainConveyorGeometry, mainConveyorMaterial);
            mainConveyor.position.set(0, -0.3, z);
            mainConveyor.receiveShadow = true;
            this.scene.add(mainConveyor);
        }
    }
    
    // 🔮 Predictive Analytics (Business Intelligence)
    calculatePredictiveMaintenance(machineId) {
        const machine = this.machines[machineId];
        if (!machine) return null;
        
        // Simulate predictive algorithm based on multiple factors
        const factors = {
            temperature: machine.temperature,
            vibration: machine.vibration,
            efficiency: machine.efficiency,
            runTime: Date.now() - new Date(machine.lastMaintenance).getTime(),
            historicalPattern: Math.random() * 0.3 + 0.7 // Simulated ML score
        };
        
        // Calculate risk score (0-1)
        const tempRisk = Math.max(0, (factors.temperature - 75) / 25); // Risk above 75°C
        const vibrationRisk = factors.vibration / 10; // Normalize to 0-1
        const efficiencyRisk = Math.max(0, (85 - factors.efficiency) / 20); // Risk below 85%
        const timeRisk = Math.min(1, factors.runTime / (30 * 24 * 60 * 60 * 1000)); // Days since maintenance
        
        const overallRisk = (tempRisk + vibrationRisk + efficiencyRisk + timeRisk) / 4;
        
        // Predict maintenance window
        const daysToMaintenance = Math.max(0, 14 - (overallRisk * 14)); // 0-14 days
        const maintenanceDate = new Date(Date.now() + daysToMaintenance * 24 * 60 * 60 * 1000);
        
        return {
            riskScore: overallRisk,
            daysToMaintenance: Math.round(daysToMaintenance),
            predictedMaintenanceDate: maintenanceDate,
            factors: factors,
            recommendation: this.getMaintenanceRecommendation(overallRisk, daysToMaintenance)
        };
    }
    
    // 💡 Get Maintenance Recommendation
    getMaintenanceRecommendation(riskScore, daysToMaintenance) {
        if (riskScore > 0.8) {
            return {
                priority: 'CRITICAL',
                action: '🚨 Programar técnico inmediatamente',
                color: '#ff4757'
            };
        } else if (riskScore > 0.6) {
            return {
                priority: 'HIGH',
                action: '⚠️ Programar técnico en 24-48 horas',
                color: '#ffa502'
            };
        } else if (daysToMaintenance <= 2) {
            return {
                priority: 'MEDIUM',
                action: '📅 Programar técnico esta semana',
                color: '#3742fa'
            };
        } else {
            return {
                priority: 'LOW',
                action: '✅ Funcionamiento normal',
                color: '#00ff88'
            };
        }
    }
}
}

// 🌟 Export for global use
window.SmartFactory3D = SmartFactory3D;

console.log('🏭 Smart Factory 3D Digital Twins - Three.js Implementation loaded');
console.log('📋 Features: Real-time machine monitoring, 3D visualization, WebSocket integration');