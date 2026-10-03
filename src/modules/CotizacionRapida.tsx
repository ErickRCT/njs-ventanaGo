import { urlImagen } from '../utils/imagenes.ts';





const CotizacionRapida = () => {

  return (
    <div>
      <h1>Cotización Rápida</h1>
      <div>
        <p>series:</p>
        <img src={urlImagen('pautas/VentanaCorrederaMonoRriel.jpg')} alt="Baranda con pernos" style={{ maxWidth: '100%', height: 'auto' }} />
        {/* {imageUrl && <img src={imageUrl} alt="Baranda con pernos" style={{ maxWidth: '100%', height: 'auto' }} />} */}
      </div>
    </div>
  );
};

export default CotizacionRapida;
