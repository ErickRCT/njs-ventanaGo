
export const listItemStyles = (selectedModel: number | null, item: number) => ({
    boxShadow: selectedModel === item ? "0px 4px 15px rgba(0, 0, 0, 0.2)" : "none",
    backgroundColor: selectedModel === item ? "#f5f5f5" : "transparent",
    "&:hover": {
      backgroundColor: "#e0e0e0", // Cambio al pasar el mouse sobre el elemento
    },
  });

  export const listItemAddProductStyles = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid #ccc",
    borderRadius: "8px",
    p: 2,
    width: "100%",
  };

  export const addProductBoxStyles = {
    mt: 4,
    border: "1px solid #ccc",
    borderRadius: "8px",
    p: 2,
    backgroundColor: "#f9f9f9",
  };
  
  export const productBoxStyles = {
    cursor: "pointer",
    border: "1px solid #ddd",
    borderRadius: 2,
    overflow: "hidden",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: 3,
    },
  };

  export const modelListPrincipalBoxStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ccc",
    borderRadius: "8px",

    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    padding: "20px",
    pr: "0",
    flex: 1, // Ocupar el mismo espacio que el otro box

    width: "100%", // Asegurar que sea responsivo
  };
  
  export const modelListScrollBoxStyles = {
    maxHeight: "350px", // Limita la altura del box
    overflowY: "auto", // Habilita el scroll vertical
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#888",
      
    },
  };
  
  export const productListBoxStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: "8px",

  };
  