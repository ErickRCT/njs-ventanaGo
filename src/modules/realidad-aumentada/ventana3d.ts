import * as THREE from "three";

// Medidas en metros. La ventana se modela con el centro en el origen y el frente hacia +Z.
export const VENTANA = { ancho: 1.2, alto: 1.0, profundidad: 0.07 };

const GROSOR_MARCO = 0.05;
const GROSOR_TRAVESANO = 0.03;
const GROSOR_VIDRIO = 0.008;

/** Ventana corrediza de dos hojas: marco, travesaño central y vidrio translúcido. */
export const crearVentana = (): THREE.Group => {
    const { ancho, alto, profundidad } = VENTANA;
    const materialMarco = new THREE.MeshStandardMaterial({
        name: "Marco", color: 0xb8bcc7, metalness: 0.8, roughness: 0.35,
    });
    const materialVidrio = new THREE.MeshStandardMaterial({
        name: "Vidrio", color: 0xbfe6ff, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.28,
    });

    const ventana = new THREE.Group();
    const pieza = (w: number, h: number, d: number, x: number, y: number, material: THREE.Material) => {
        const malla = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        malla.position.set(x, y, 0);
        ventana.add(malla);
    };

    const altoInterior = alto - 2 * GROSOR_MARCO;
    pieza(ancho, GROSOR_MARCO, profundidad, 0, (alto - GROSOR_MARCO) / 2, materialMarco);
    pieza(ancho, GROSOR_MARCO, profundidad, 0, -(alto - GROSOR_MARCO) / 2, materialMarco);
    pieza(GROSOR_MARCO, altoInterior, profundidad, -(ancho - GROSOR_MARCO) / 2, 0, materialMarco);
    pieza(GROSOR_MARCO, altoInterior, profundidad, (ancho - GROSOR_MARCO) / 2, 0, materialMarco);
    pieza(GROSOR_TRAVESANO, altoInterior, profundidad, 0, 0, materialMarco);
    pieza(ancho - 2 * GROSOR_MARCO, altoInterior, GROSOR_VIDRIO, 0, 0, materialVidrio);

    return ventana;
};

/** Libera geometrías y materiales de todo lo que cuelgue de `objeto`. */
export const liberar = (objeto: THREE.Object3D) => {
    objeto.traverse((hijo) => {
        const malla = hijo as THREE.Mesh;
        malla.geometry?.dispose();
        const material = malla.material;
        if (material) (Array.isArray(material) ? material : [material]).forEach((m) => m.dispose());
    });
};

export interface ModelosVentana {
    /** Para la vista 3D de la página. */
    glbUrl: string;
    /** Para Quick Look en iPhone: la ventana se ancla a una pared vertical. */
    usdzUrl: string;
    liberar: () => void;
}

/**
 * Genera en el navegador los archivos 3D que necesita model-viewer, a partir de la misma
 * ventana que usa la AR guiada. Three.js y los exportadores se cargan solo al llamar aquí.
 */
export const exportarModelos = async (): Promise<ModelosVentana> => {
    const [{ GLTFExporter }, { USDZExporter }] = await Promise.all([
        import("three/addons/exporters/GLTFExporter.js"),
        import("three/addons/exporters/USDZExporter.js"),
    ]);

    const escenaGlb = new THREE.Scene();
    escenaGlb.add(crearVentana());
    const glb = (await new GLTFExporter().parseAsync(escenaGlb, { binary: true })) as ArrayBuffer;

    // En una pared vertical Quick Look usa +Y como normal de la superficie, así que el frente (+Z) se gira hacia +Y.
    const escenaUsdz = new THREE.Scene();
    const ventanaPared = crearVentana();
    ventanaPared.rotation.x = -Math.PI / 2;
    escenaUsdz.add(ventanaPared);
    escenaUsdz.updateMatrixWorld(true);
    const usdz = await new USDZExporter().parseAsync(escenaUsdz, {
        quickLookCompatible: true,
        ar: { anchoring: { type: "plane" }, planeAnchoring: { alignment: "vertical" } },
    });

    liberar(escenaGlb);
    liberar(escenaUsdz);

    const glbUrl = URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));
    const usdzUrl = URL.createObjectURL(new Blob([usdz as BlobPart], { type: "model/vnd.usdz+zip" }));
    return {
        glbUrl,
        usdzUrl,
        liberar: () => {
            URL.revokeObjectURL(glbUrl);
            URL.revokeObjectURL(usdzUrl);
        },
    };
};
