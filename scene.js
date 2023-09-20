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
        // starting from the origin, build a chain of links with random positions, creating a bent stick
        for (let i = 0; i < 100; i++) {
            // We will use i as the "unit distance". and randomly perturb x,y,z off that distance.
            // Lets generate a "crumpled chain" of links
            const x = v.x + i - random()
            const y = v.y + i + random()
            const z = i * 0.1

            geometry.vertices.push(new Vector3(x, y, z));
        }

        return new Line(geometry, new LineBasicMaterial({ color: 0xbada55 }));
    }

    updateCamera = () => {
        // look at last vertex
        this.camera.lookAt(this.scene.children[0].geometry.vertices.slice(-1)[0]);
    }

    updateGeometry = () => {
        // perturb the vertices a little bit, using a cohesive force which rotates the vertices towards the previous vertex
        this.scene.children.forEach((child, index) => {
            if (child.geometry.vertices.length > 0) {
                // We want to fold the chain back on itself, so we will rotate each vertex towards the previous vertex
                // We will use the cross product to compute the rotation axis
                for (let i = 1; i < child.geometry.vertices.length; i++) {
                    const v1 = child.geometry.vertices[i - 1];
                    const v2 = child.geometry.vertices[i];

                    // compute the rotation axis
                    const axis = new Vector3();
                    axis.crossVectors(v1, v2);

                    axis.normalize();

                    // compute the rotation angle
                    const angle = v2.angleTo(v1, axis);

                    // rotate the vertex
                    v2.applyAxisAngle(axis, angle * 0.001);

                }
                child.geometry.verticesNeedUpdate = true;

            }
        })
    }

    updateScene = () => {
        // scene transformations
        this.scene.children.forEach((child, index) => {
            if (child.geometry.vertices.length > 0) {
                child.geometry.vertices.forEach((vertex, index) => {
                    // rotate in 3d space
                    vertex.x = vertex.x * cos(0.01) - vertex.y * sin(0.01);
                    vertex.y = vertex.x * sin(0.01) + vertex.y * cos(0.01);
                    vertex.z = vertex.z * cos(0.01) - vertex.y * sin(0.01);
                });
                child.geometry.verticesNeedUpdate = true;
            }
        }
        );
    }

    runAnimation = () => {
        // create scene
        const G = this.createGeometry({ x: 0, y: 0 });
        this.scene.add(G);

        // animation function
        const animate = () => {
            const T = performance.now();
            const deltaTime = T - this.lastFrameTime;

            if (deltaTime >= this.frameTime) {
                this.lastFrameTime = T;

                this.updateCamera();
                this.updateScene();
                this.updateGeometry();

                this.renderer.render(this.scene, this.camera);
            }

            setTimeout(animate, this.frameTime - (performance.now() - T));
        };

        // start the animation loop
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

