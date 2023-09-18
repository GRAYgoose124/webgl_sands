const { PI, sin, cos, min, max, random, ceil } = Math;
const { Scene, PerspectiveCamera, WebGLRenderer, Geometry, Line, Vector3, LineBasicMaterial } = THREE;


class SceneAnimator {
    constructor({
        scene = new Scene(),
        renderer = new WebGLRenderer({ antialias: true }),
        frameTime = 16.67, // 60fps by default
        cameraSettings = { fov: 75, near: 0.1, far: 1000, position: { z: 1 }, aspect: window.innerWidth / window.innerHeight }
    } = {}) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = new PerspectiveCamera(cameraSettings.fov, cameraSettings.aspect, cameraSettings.near, cameraSettings.far);
        this.camera.position.z = cameraSettings.position.z;

        this.frameTime = frameTime;
        this.lastFrameTime = 0;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    createGeometry = (v) => {
        const geometry = new Geometry();

        for (let i = 0; i < 100; i++) {
            const x = -1. + i / 50;
            const y = sin(x + v.x) * cos(x + v.y);
            geometry.vertices.push(new Vector3(x, y, 0));
        }

        return new Line(geometry, new LineBasicMaterial({ color: 0xbada55 }));
    }

    updateScene = () => {
        this.scene.children.forEach((child, index) => {
            if (child.geometry.vertices.length > 0) {
                child.geometry.vertices.forEach((vertex, index) => {
                    vertex.y = sin(vertex.x + this.lastFrameTime / 1000) * cos(vertex.x + this.lastFrameTime / 1000);
                });
                child.geometry.verticesNeedUpdate = true;
            }
        }
        );
    }

    runAnimation = () => {
        const G = this.createGeometry({ x: 0, y: 0 });
        this.scene.add(G);

        const animate = () => {
            const T = performance.now();
            const deltaTime = T - this.lastFrameTime;
            if (deltaTime >= this.frameTime) {
                this.lastFrameTime = T;

                this.renderer.render(this.scene, this.camera);
            }
            const remainingFrameTime = this.frameTime - (performance.now() - T);
            //requestAnimationFrame(animate);
            setTimeout(animate, remainingFrameTime);
            this.updateScene();
        };

        requestAnimationFrame(animate);
    }

    onWindowResize = () => {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

const animator = new SceneAnimator();
animator.runAnimation();

