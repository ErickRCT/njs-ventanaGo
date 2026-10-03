import * as THREE from "three";

/** Formas de ventana que sabe dibujar el visor, según las imágenes de las pautas. */
export type ModeloVentana = "corredera" | "monorriel" | "fija" | "arco" | "batiente" | "granero" | "mampara";

/** Lo que define una ventana en el visor: medidas en milímetros (como en las cotizaciones) y colores 0xRRGGBB. */
export interface ConfigVentana {
    anchoMm: number;
    altoMm: number;
    /** Hojas de vidrio de la corredera: 1 es fija, desde 2 son corredizas. */
    hojas: number;
    /** Forma de la ventana; si no se indica, corredera. */
    modelo?: ModeloVentana;
    colorMarco: number;
    colorVidrio: number;
}

export const CONFIG_POR_DEFECTO: ConfigVentana = {
    anchoMm: 1200, altoMm: 1000, hojas: 2, colorMarco: 0xb8bcc7, colorVidrio: 0xbfe6ff,
};

/** Medidas en metros, que es la unidad del modelo 3D y de la AR. */
export const dimensionesM = ({ anchoMm, altoMm }: ConfigVentana) => ({ ancho: anchoMm / 1000, alto: altoMm / 1000 });

const PROFUNDIDAD = 0.07;
const GROSOR_MARCO = 0.05;
const GROSOR_HOJA = 0.04;
const PROFUNDIDAD_HOJA = 0.03;
const GROSOR_TRAVESANO = 0.03;
const GROSOR_VIDRIO = 0.008;
/** Lo que se montan las hojas de una corredera una sobre otra. */
const SOLAPE = 0.03;
/** Separación entre rieles de la corredera. */
const PASO_RIEL = 0.016;

interface Piezas {
    grupo: THREE.Group;
    marco: THREE.Material;
    vidrio: THREE.Material;
    herraje: THREE.Material;
}

const caja = (p: Piezas, material: THREE.Material, w: number, h: number, d: number, x: number, y: number, z = 0) => {
    const malla = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    malla.position.set(x, y, z);
    p.grupo.add(malla);
};

/** Rectángulo de perfiles (marco u hoja) centrado en (x, y). */
const rectangulo = (p: Piezas, w: number, h: number, grosor: number, d: number, x: number, y: number, z = 0) => {
    caja(p, p.marco, w, grosor, d, x, y + (h - grosor) / 2, z);
    caja(p, p.marco, w, grosor, d, x, y - (h - grosor) / 2, z);
    caja(p, p.marco, grosor, h - 2 * grosor, d, x - (w - grosor) / 2, y, z);
    caja(p, p.marco, grosor, h - 2 * grosor, d, x + (w - grosor) / 2, y, z);
};

/** Hoja con su propio perfil y vidrio, como las correderas y las puertas de las imágenes. */
const hoja = (p: Piezas, w: number, h: number, x: number, y: number, z: number) => {
    rectangulo(p, w, h, GROSOR_HOJA, PROFUNDIDAD_HOJA, x, y, z);
    caja(p, p.vidrio, w - 2 * GROSOR_HOJA, h - 2 * GROSOR_HOJA, GROSOR_VIDRIO, x, y, z);
};

/** Tirador/pestillo vertical de corredera, sobre la cara de la hoja. */
const tirador = (p: Piezas, x: number, z: number) => {
    caja(p, p.herraje, 0.018, 0.12, 0.02, x, 0, z + PROFUNDIDAD_HOJA / 2 + 0.01);
};

/** Corredera de n hojas: cada hoja en su riel, montadas unas sobre otras (2 rieles, o 3 desde 6 hojas). */
const corredera = (p: Piezas, ancho: number, alto: number, n: number) => {
    rectangulo(p, ancho, alto, GROSOR_MARCO, PROFUNDIDAD, 0, 0);
    const anchoInterior = ancho - 2 * GROSOR_MARCO;
    const altoInterior = alto - 2 * GROSOR_MARCO;
    if (n <= 1) {
        caja(p, p.vidrio, anchoInterior, altoInterior, GROSOR_VIDRIO, 0, 0);
        return;
    }
    const rieles = n >= 6 ? 3 : 2;
    const anchoHoja = anchoInterior / n + SOLAPE;
    const paso = (anchoInterior - anchoHoja) / (n - 1);
    // Con un número par de hojas (desde 4) abren desde el centro: las centrales van en el riel de adelante.
    const simetrica = n >= 4 && n % 2 === 0;
    for (let i = 0; i < n; i++) {
        const riel = simetrica ? Math.min(i, n - 1 - i, rieles - 1) : i % rieles;
        const z = (riel - (rieles - 1) / 2) * PASO_RIEL;
        const x = -anchoInterior / 2 + anchoHoja / 2 + i * paso;
        hoja(p, anchoHoja, altoInterior, x, 0, z);
        // Los tiradores quedan donde se juntan las hojas del centro.
        if (i === Math.floor((n - 1) / 2)) tirador(p, x + anchoHoja / 2 - GROSOR_HOJA / 2, z);
        if (i === Math.ceil((n - 1) / 2) && n % 2 === 0) tirador(p, x - anchoHoja / 2 + GROSOR_HOJA / 2, z);
    }
};

/** Monorriel: un paño fijo a la izquierda y una hoja corredera a la derecha con su tirador. */
const monorriel = (p: Piezas, ancho: number, alto: number) => {
    rectangulo(p, ancho, alto, GROSOR_MARCO, PROFUNDIDAD, 0, 0);
    const anchoInterior = ancho - 2 * GROSOR_MARCO;
    const altoInterior = alto - 2 * GROSOR_MARCO;
    const mitad = anchoInterior / 2;
    caja(p, p.marco, GROSOR_TRAVESANO, altoInterior, PROFUNDIDAD, 0, 0);
    caja(p, p.vidrio, mitad - GROSOR_TRAVESANO / 2, altoInterior, GROSOR_VIDRIO, -mitad / 2 - GROSOR_TRAVESANO / 4, 0, -PASO_RIEL / 2);
    const xHoja = mitad / 2 + GROSOR_TRAVESANO / 4;
    const anchoHoja = mitad - GROSOR_TRAVESANO / 2;
    hoja(p, anchoHoja, altoInterior, xHoja, 0, PASO_RIEL / 2);
    tirador(p, xHoja + anchoHoja / 2 - GROSOR_HOJA / 2, PASO_RIEL / 2);
};

/** Contorno de ventana con arco arriba: tramo recto y medio óvalo que ocupa todo el ancho. */
const contornoArco = <T extends THREE.Path>(w: number, h: number, altoArco: number, forma: T): T => {
    const base = -h / 2;
    const inicioArco = h / 2 - altoArco;
    forma.moveTo(-w / 2, base);
    forma.lineTo(w / 2, base);
    forma.lineTo(w / 2, inicioArco);
    forma.absellipse(0, inicioArco, w / 2, altoArco, 0, Math.PI, false, 0);
    forma.lineTo(-w / 2, base);
    return forma;
};

const extruir = (forma: THREE.Shape, profundidad: number) => {
    const geometria = new THREE.ExtrudeGeometry(forma, { depth: profundidad, bevelEnabled: false, curveSegments: 40 });
    geometria.translate(0, 0, -profundidad / 2);
    return geometria;
};

/** Ventana fija con la parte de arriba en arco. */
const arco = (p: Piezas, ancho: number, alto: number) => {
    // El arco es semicircular salvo que la ventana sea tan baja que no quepa.
    const altoArco = Math.min(ancho / 2, alto * 0.6);
    const exterior = contornoArco(ancho, alto, altoArco, new THREE.Shape());
    const anchoInt = ancho - 2 * GROSOR_MARCO;
    const altoInt = alto - 2 * GROSOR_MARCO;
    const altoArcoInt = Math.max(0.01, altoArco - GROSOR_MARCO);
    exterior.holes.push(contornoArco(anchoInt, altoInt, altoArcoInt, new THREE.Path()));
    p.grupo.add(new THREE.Mesh(extruir(exterior, PROFUNDIDAD), p.marco));
    p.grupo.add(new THREE.Mesh(extruir(contornoArco(anchoInt, altoInt, altoArcoInt, new THREE.Shape()), GROSOR_VIDRIO), p.vidrio));
};

/** Puerta o ventana batiente de una hoja: manilla a la izquierda y bisagras a la derecha. */
const batiente = (p: Piezas, ancho: number, alto: number) => {
    rectangulo(p, ancho, alto, GROSOR_MARCO, PROFUNDIDAD, 0, 0);
    const anchoInterior = ancho - 2 * GROSOR_MARCO;
    const altoInterior = alto - 2 * GROSOR_MARCO;
    hoja(p, anchoInterior, altoInterior, 0, 0, 0.01);
    const zFrente = 0.01 + PROFUNDIDAD_HOJA / 2;
    // En puertas la manilla va a ~1 m del piso; en ventanas bajas, al medio.
    const yManilla = alto > 1.6 ? -alto / 2 + 1.0 : 0;
    const xManilla = -anchoInterior / 2 + GROSOR_HOJA / 2;
    caja(p, p.herraje, 0.03, 0.14, 0.012, xManilla, yManilla - 0.03, zFrente + 0.006);
    caja(p, p.herraje, 0.13, 0.02, 0.02, xManilla + 0.065, yManilla, zFrente + 0.035);
    caja(p, p.herraje, 0.016, 0.02, 0.035, xManilla, yManilla, zFrente + 0.018);
    for (const y of [altoInterior / 2 - 0.12, -altoInterior / 2 + 0.12]) {
        caja(p, p.herraje, 0.018, 0.1, 0.03, anchoInterior / 2 + 0.004, y, zFrente);
    }
};

/** Puerta doble de granero: dos vidrios sin marco colgados con ruedas de un riel superior, con tiradores largos. */
const granero = (p: Piezas, ancho: number, alto: number) => {
    const altoRiel = 0.06;
    const altoVidrio = alto - altoRiel - 0.05;
    const yVidrio = -alto / 2 + altoVidrio / 2;
    const zVidrio = 0.03;
    const yRiel = alto / 2 - altoRiel / 2;
    // Barra del riel, un poco más ancha que el vano, separada de la pared.
    const riel = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, ancho + 0.1, 16), p.herraje);
    riel.rotation.z = Math.PI / 2;
    riel.position.set(0, yRiel, zVidrio + 0.03);
    p.grupo.add(riel);
    for (const x of [-(ancho + 0.1) / 2 + 0.05, 0, (ancho + 0.1) / 2 - 0.05]) {
        caja(p, p.herraje, 0.02, 0.02, 0.05, x, yRiel, zVidrio + 0.005);
    }
    const hueco = 0.01;
    const anchoHoja = (ancho - hueco) / 2;
    for (const lado of [-1, 1]) {
        const x = lado * (anchoHoja + hueco) / 2;
        caja(p, p.vidrio, anchoHoja, altoVidrio, 0.01, x, yVidrio, zVidrio);
        // Dos ruedas por hoja, unidas al vidrio por una platina.
        for (const dx of [-anchoHoja / 2 + 0.1, anchoHoja / 2 - 0.1]) {
            const rueda = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.015, 24), p.herraje);
            rueda.rotation.x = Math.PI / 2;
            rueda.position.set(x + dx, yRiel + 0.02, zVidrio + 0.03);
            p.grupo.add(rueda);
            caja(p, p.herraje, 0.03, yRiel - (yVidrio + altoVidrio / 2) + 0.06, 0.006, x + dx, (yRiel + yVidrio + altoVidrio / 2) / 2, zVidrio + 0.012);
        }
        // Tirador vertical largo junto a la unión de las hojas.
        const largo = Math.min(1.2, altoVidrio * 0.6);
        const xTirador = x - lado * (anchoHoja / 2 - 0.08);
        const tiradorLargo = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, largo, 12), p.herraje);
        tiradorLargo.position.set(xTirador, yVidrio, zVidrio + 0.05);
        p.grupo.add(tiradorLargo);
        for (const dy of [-largo / 2 + 0.05, largo / 2 - 0.05]) {
            caja(p, p.herraje, 0.012, 0.012, 0.045, xTirador, yVidrio + dy, zVidrio + 0.027);
        }
    }
};

/** Mampara de baño: puerta de vidrio abatible entre dos paños fijos, sin marco, con bisagras y manilla en L. */
const mampara = (p: Piezas, ancho: number, alto: number) => {
    const hueco = 0.008;
    const proporciones = [0.35, 0.34, 0.31];
    const util = ancho - hueco * (proporciones.length - 1);
    let x = -ancho / 2;
    const vidrios = proporciones.map((proporcion) => {
        const w = util * proporcion;
        const centro = x + w / 2;
        x += w + hueco;
        caja(p, p.vidrio, w, alto, 0.01, centro, 0, 0);
        return { centro, w };
    });
    const [fijoIzq, puerta, fijoDer] = vidrios;
    const clip = (cx: number, cy: number) => caja(p, p.herraje, 0.035, 0.035, 0.025, cx, cy, 0);
    // Pinzas a la pared y al piso de los fijos.
    clip(fijoIzq.centro - fijoIzq.w / 2 + 0.018, alto / 2 - 0.2);
    clip(fijoIzq.centro - fijoIzq.w / 2 + 0.018, -alto / 2 + 0.2);
    for (const fijo of [fijoIzq, fijoDer]) {
        clip(fijo.centro - fijo.w / 4, -alto / 2 + 0.018);
        clip(fijo.centro + fijo.w / 4, -alto / 2 + 0.018);
    }
    clip(fijoDer.centro + fijoDer.w / 2 - 0.018, alto / 2 - 0.2);
    clip(fijoDer.centro + fijoDer.w / 2 - 0.018, -alto / 2 + 0.2);
    // Bisagras entre la puerta y el fijo derecho.
    const xBisagra = puerta.centro + puerta.w / 2;
    for (const y of [alto / 2 - 0.25, -alto / 2 + 0.25]) {
        caja(p, p.herraje, 0.05, 0.08, 0.03, xBisagra, y, 0);
    }
    // Manilla en L a media altura, cerca del borde que abre.
    const yManilla = alto > 1.6 ? -alto / 2 + 1.05 : 0;
    const xManilla = puerta.centro - puerta.w / 2 + 0.08;
    const largo = Math.min(0.3, puerta.w * 0.6);
    caja(p, p.herraje, 0.018, 0.12, 0.018, xManilla, yManilla + 0.06, 0.04);
    caja(p, p.herraje, largo, 0.018, 0.018, xManilla + largo / 2, yManilla, 0.04);
    caja(p, p.herraje, 0.012, 0.012, 0.035, xManilla, yManilla, 0.02);
    caja(p, p.herraje, 0.012, 0.012, 0.035, xManilla + largo, yManilla, 0.02);
};

/** Ventana según su modelo, con los colores de marco y vidrio elegidos. Centro en el origen y frente hacia +Z. */
export const crearVentana = (config: ConfigVentana = CONFIG_POR_DEFECTO): THREE.Group => {
    const { ancho, alto } = dimensionesM(config);
    const modelo = config.modelo ?? "corredera";
    const sinMarco = modelo === "granero" || modelo === "mampara";
    const piezas: Piezas = {
        grupo: new THREE.Group(),
        marco: new THREE.MeshStandardMaterial({
            name: "Marco", color: config.colorMarco, metalness: 0.8, roughness: 0.35,
        }),
        vidrio: new THREE.MeshStandardMaterial({
            name: "Vidrio", color: config.colorVidrio, metalness: 0, roughness: sinMarco ? 0.3 : 0.05,
            // Las puertas de vidrio sin marco de las imágenes son más opacas (satinadas).
            transparent: true, opacity: sinMarco ? 0.45 : 0.28,
        }),
        herraje: new THREE.MeshStandardMaterial({
            name: "Herraje", color: 0xc9ccd1, metalness: 0.9, roughness: 0.25,
        }),
    };

    switch (modelo) {
        case "monorriel": monorriel(piezas, ancho, alto); break;
        case "fija": corredera(piezas, ancho, alto, 1); break;
        case "arco": arco(piezas, ancho, alto); break;
        case "batiente": batiente(piezas, ancho, alto); break;
        case "granero": granero(piezas, ancho, alto); break;
        case "mampara": mampara(piezas, ancho, alto); break;
        default: corredera(piezas, ancho, alto, config.hojas);
    }
    return piezas.grupo;
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
export const exportarModelos = async (config: ConfigVentana = CONFIG_POR_DEFECTO): Promise<ModelosVentana> => {
    const [{ GLTFExporter }, { USDZExporter }] = await Promise.all([
        import("three/addons/exporters/GLTFExporter.js"),
        import("three/addons/exporters/USDZExporter.js"),
    ]);

    const escenaGlb = new THREE.Scene();
    escenaGlb.add(crearVentana(config));
    const glb = (await new GLTFExporter().parseAsync(escenaGlb, { binary: true })) as ArrayBuffer;

    // En una pared vertical Quick Look usa +Y como normal de la superficie, así que el frente (+Z) se gira hacia +Y.
    const escenaUsdz = new THREE.Scene();
    const ventanaPared = crearVentana(config);
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
